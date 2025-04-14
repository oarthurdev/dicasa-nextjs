import express, { Request, Response } from "express";
import { storage } from "../storage";
import bcrypt from "bcryptjs";
import { kommoApi } from "./kommo";

const router = express.Router();

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome de usuário e senha são obrigatórios",
      });
    }

    // Primeiro, tente autenticar usando o Kommo API se disponível
    if (kommoApi.isConnected()) {
      try {
        const kommoAuthSuccess = await kommoApi.authenticate(
          username,
          password,
        );
        
        if (kommoAuthSuccess) {
          // Verificar se o usuário existe no banco local
          let user = await storage.getUserByUsername(username);

          if (!user) {
            // Tentar obter informações do usuário do Kommo
            const kommoUsers = await kommoApi.getUsers();
            const kommoUser = kommoUsers.find((u) => u.username === username);

            if (kommoUser) {
              // Criar usuário no banco local com as informações do Kommo
              user = await storage.createUser({
                username: kommoUser.username,
                password: await bcrypt.hash(password, 10),
                nome: kommoUser.nome,
                email: kommoUser.email,
                cargo: kommoUser.cargo,
                kommo_id: kommoUser.kommo_id,
              });
            } else {
              // Criar um usuário básico se não encontrado no Kommo
              user = await storage.createUser({
                username,
                password: await bcrypt.hash(password, 10),
                nome: username,
                email: `${username}@example.com`,
                cargo: "corretor",
              });
            }
          }

          // Definir o usuário na sessão
          if (req.session) {
            req.session.userId = user.id;
            req.session.userAuthenticated = kommoAuthSuccess;
          }

          return res.json({
            success: true,
            message: "Login realizado com sucesso via Kommo",
            user: {
              id: user.id,
              username: user.username,
              nome: user.nome,
              email: user.email,
              cargo: user.cargo,
            },
          });
        }
      } catch (kommoError) {
        console.error("Erro na autenticação Kommo:", kommoError);
        // Continue para tentar autenticação local
      }
    }

    // Autenticação no banco local se falhar a autenticação Kommo
    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Verificar a senha (apenas se tiver senha salva)
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Senha incorreta",
        });
      }
    } else {
      // Se não tiver senha salva, atualizar com a senha fornecida
      await storage.updateUser(user.id, {
        password: await bcrypt.hash(password, 10),
      });
    }

    // Definir o usuário na sessão
    if (req.session) {
      req.session.userId = user.id;
    }

    return res.json({
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Verificar autenticação atual
router.get("/check", async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        authenticated: false,
        message: "Usuário não autenticado",
      });
    }

    const user = await storage.getUser(req.session.userId);

    if (!user) {
      // Limpar sessão se o usuário não existir mais
      if (req.session) {
        req.session.destroy((err) => {
          if (err) console.error("Erro ao destruir sessão:", err);
        });
      }

      return res.status(401).json({
        authenticated: false,
        message: "Usuário não encontrado",
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    });
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    res.status(500).json({
      authenticated: false,
      message: "Erro interno no servidor",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Logout endpoint
router.post("/verify", async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Session inválida"
      });
    }

    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) console.error("Erro ao destruir sessão:", err);
        });
      }
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo
      }
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao verificar sessão"
    });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        return res.status(500).json({
          success: false,
          message: "Erro ao fazer logout",
        });
      }

      res.json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    });
  } else {
    res.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  }
});

export default router;
