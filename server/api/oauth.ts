import express, { Request, Response } from "express";
import { kommoApi } from "./kommo";

const router = express.Router();

/**
 * Status da conexão OAuth com a Kommo
 */
router.get("/status", (req: Request, res: Response) => {
  try {
    // Verificar se a API Kommo está configurada
    const isConnected = kommoApi.isConnected();

    res.json({
      connected: isConnected,
      apiCredentials: {
        clientIdConfigured: !!process.env.KOMMO_CLIENT_ID,
        clientSecretConfigured: !!process.env.KOMMO_CLIENT_SECRET,
      },
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Diagnóstico detalhado da conexão com a Kommo (para depuração)
 */
router.get("/diagnose", (req: Request, res: Response) => {
  try {
    // Verificar configurações da API Kommo
    const apiConfig = {
      baseUrl: "https://dicasaindaial.kommo.com/api/v4",
      clientIdConfigured: !!process.env.KOMMO_CLIENT_ID,
      clientSecretConfigured: !!process.env.KOMMO_CLIENT_SECRET,
      isDevelopment: process.env.NODE_ENV === "development",
    };

    // Verificar configurações do ambiente
    const envConfig = {
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
    };

    res.json({
      apiConfig,
      tokenStatus: {
        isConnected: kommoApi.isConnected(),
      },
      systemTime: new Date().toISOString(),
      serverEnvironment: envConfig,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error getting diagnostic information",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Iniciar o processo de autorização Kommo OAuth2
 */
router.get("/auth", (req: Request, res: Response) => {
  // Em uma implementação real, você geraria uma URL de autorização para o OAuth2
  const authUrl = "https://kommo.com/oauth/";
  res.json({ authUrl });
});

/**
 * Rota para configurar manualmente o token (apenas para desenvolvimento/testes)
 */
router.post("/set-token", (req: Request, res: Response) => {
  try {
    const { access_token, refresh_token, expires_in } = req.body;

    if (!access_token || !refresh_token || !expires_in) {
      return res.status(400).json({
        success: false,
        message:
          "Todos os campos são obrigatórios: access_token, refresh_token, expires_in",
      });
    }

    // Configurar os tokens na instância da API
    kommoApi.setTokens(access_token, refresh_token, Number(expires_in));

    res.json({
      success: true,
      message: "Token configurado manualmente com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao configurar o token",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Callback para receber o código de autorização após autenticação na Kommo
 */
router.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      message: "Código de autorização não fornecido",
    });
  }

  console.log(`Received authorization code: ${code.substring(0, 20)}...`);

  // Em uma implementação real, você trocaria o código por um token
  // Simulação de sucesso para fins de demonstração
  return res.json({
    success: true,
    message:
      "Esta é uma rota simulada. Em produção, trocaria o código por um token OAuth2.",
  });
});

/**
 * Página de callback para o processo OAuth
 */
router.get("/callback-page", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Autenticação Kommo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        h1 {
          color: #333;
        }
        .success {
          color: green;
        }
        .error {
          color: red;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Autenticação Kommo</h1>
        <p id="message">
          Processando código de autorização...
        </p>
        <div id="statusContainer"></div>
        <script>
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const error = params.get('error');
          const messageElement = document.getElementById('message');
          const statusContainer = document.getElementById('statusContainer');
          
          if (error) {
            messageElement.classList.add('error');
            messageElement.textContent = 'Erro: ' + error;
          } else if (code) {
            fetch('/api/oauth/callback?code=' + encodeURIComponent(code))
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  messageElement.classList.add('success');
                  messageElement.textContent = 'Autenticação realizada com sucesso!';
                } else {
                  messageElement.classList.add('error');
                  messageElement.textContent = data.message || 'Falha na autenticação';
                }
              })
              .catch(err => {
                messageElement.classList.add('error');
                messageElement.textContent = 'Erro: ' + err.message;
              });
          } else {
            messageElement.classList.add('error');
            messageElement.textContent = 'Código de autorização não fornecido.';
          }
        </script>
      </div>
    </body>
    </html>
  `);
});

export default router;
