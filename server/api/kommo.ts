import axios from "axios";
import * as cheerio from "cheerio";
import { User, InsertUser } from "@shared/schema";
import { storage } from "../storage";

class KommoAPI {
  private baseUrl: string = "https://dicasaindaial.kommo.com/api/v4";
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private accessToken: string | null =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImE4MjQwNzIxMmFiYzQ5OGFkMzNjMjEyYmQxOWFkNWU0ZDA2OTEzNTQ0ZjA5NTNhYmZjMmE0ZWM3MjZkZTQwZjE1N2UxOTRlMmQxYzg2NzdkIn0.eyJhdWQiOiJkODc2NTVkMS1jZWY1LTQwNzQtOWJjZC02N2IzY2NkYTAwOWIiLCJqdGkiOiJhODI0MDcyMTJhYmM0OThhZDMzYzIxMmJkMTlhZDVlNGQwNjkxMzU0NGYwOTUzYWJmYzJhNGVjNzI2ZGU0MGYxNTdlMTk0ZTJkMWM4Njc3ZCIsImlhdCI6MTc0NDY1NDAzNywibmJmIjoxNzQ0NjU0MDM3LCJleHAiOjE3NjcyMjU2MDAsInN1YiI6IjExMzg5NTQzIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyOTI2NzE1LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYmFiYmNiMTgtODBkOC00MzRlLTlhYmYtMzc3YWEwZTc2Y2VlIiwiYXBpX2RvbWFpbiI6ImFwaS1nLmtvbW1vLmNvbSJ9.kqShCrLYnmi52MlkQv2V6zHTRhonn84d1U_sop2YZyrWj-yp9ZDzoctrBSpQaEidfkoQkjOVFitccXYr-wSIcPRZRxUa2Jc-waLyh6W6Ggj4IplPPtuxUI-yrAksaIeavrP8jOVyWSqPbJ60Fr5jgnB94ZXh5eVBeeSDBBKYdCuxT5eFCBz76KIqEBVe7QSrdVlzvayWj7G28C_LZB-AJrPyDFyLDJyuSHTm6p88Ab4w-r2wmW5NjdUMBTsLDhJOdTv9j0V_0QXtFdEbldUYX3Knot9hJoDnyr4Wa9NHpKasvn-mLyxU_D8fA7Dr2OtOwbIf4GRfNT57_6qiHbIJ2A";
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.KOMMO_CLIENT_ID;
    this.clientSecret = process.env.KOMMO_CLIENT_SECRET;

    if (this.clientId && this.clientSecret) {
      console.log("Kommo API credentials found");
    } else {
      console.warn(
        "Kommo API credentials not found. Some features may not work.",
      );
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    params?: any,
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error("No valid token for Kommo API");
    }

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error(`Error in Kommo API request to ${endpoint}:`, error);
      throw error;
    }
  }

  async getUsers(): Promise<InsertUser[]> {
    try {
      let users = [];
      let page = 1;

      while (true) {
        const response = await this.request<any>("GET", "users", {
          page,
          limit: 50,
          with: "roles",
        });

        if (!response._embedded?.users?.length) {
          break;
        }

        // Process users from response
        const processedUsers = response._embedded.users.map((user: any) => ({
          username: user.email,
          password: "default123", // Senha temporária
          nome: `${user.name} ${user.lastname}`.trim(),
          email: user.email,
          cargo: user.rights?.is_admin ? "administrador" : "corretor",
          kommo_id: user.id,
          avatar_url: user._links?.avatar?.href,
        }));

        users.push(...processedUsers);
        page++;
      }

      return users;
    } catch (error) {
      console.error("Error getting users from Kommo:", error);
      return [];
    }
  }

  async getLeads() {
    try {
      let leads = [];
      let page = 1;
      const maxPages = 5; // Limite de 5 páginas (250 leads)

      while (page <= maxPages) {
        const response = await this.request<any>("GET", "leads", {
          page,
          limit: 50,
          with: "contacts,pipeline_id",
        });

        if (!response._embedded?.leads?.length) {
          break;
        }

        // Process leads
        const processedLeads = response._embedded.leads.map((lead: any) => ({
          kommo_id: lead.id,
          nome: lead.name,
          responsavel_id: lead.responsible_user_id,
          status:
            lead.status_id === 142
              ? "Ganho"
              : lead.status_id === 143
                ? "Perdido"
                : "Em progresso",
          pipeline_id: lead.pipeline_id,
          status_id: lead.status_id,
          etapa_categoria: lead._embedded?.status?.name || "Desconhecido",
          criado_em: new Date(lead.created_at * 1000),
          atualizado_em: new Date(lead.updated_at * 1000),
        }));

        leads.push(...processedLeads);
        page++;
      }

      return leads;
    } catch (error) {
      console.error("Error getting leads from Kommo:", error);
      return [];
    }
  }

  async getActivities() {
    try {
      let activities = [];
      let page = 1;
      const maxPages = 5; // Limite de 5 páginas

      while (page <= maxPages) {
        const response = await this.request<any>("GET", "events", {
          page,
          limit: 50,
        });

        if (!response._embedded?.events?.length) {
          break;
        }

        // Process activities
        const processedActivities = response._embedded.events.map(
          (event: any) => ({
            id: event.id,
            lead_id: event.entity_id,
            user_id: event.created_by,
            tipo: event.type,
            valor_antigo: event.value_before,
            valor_novo: event.value_after,
            criado_em: new Date(event.created_at * 1000),
          }),
        );

        activities.push(...processedActivities);
        page++;
      }

      return activities;
    } catch (error) {
      console.error("Error getting activities from Kommo:", error);
      return [];
    }
  }
  /**
   * Verifica se a API Kommo está configurada
   */
  isConnected(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Configura os tokens para autorização
   */
  setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
  }

  private async getCsrfToken(): Promise<string | null> {
    try {
      let html: string;
      try {
        const response = await axios.get("https://dicasaindaial.kommo.com", {
          headers: {
            Accept: "text/html",
            "User-Agent": "Mozilla/5.0",
            "Cache-Control": "no-cache",
          },
          validateStatus: (status) => status === 200 || status === 401,
        });
        html = response.data;
      } catch (error: any) {
        if (error.response?.status === 401 && error.response?.data) {
          html = error.response.data;
        } else {
          throw error;
        }
      }

      const $ = cheerio.load(html);

      // Buscar o token CSRF na página de login
      const token =
        $('input[name="csrf_token"]').attr("value") ||
        $('meta[name="csrf-token"]').attr("content") ||
        $('input[name="_csrf"]').attr("value");

      if (token) {
        console.log("✅ CSRF token encontrado:", token);
        return token;
      }

      // Se não encontrar pelos seletores comuns, tentar buscar por script
      const scriptContent = $('script:contains("csrf")').text();
      const csrfMatch = scriptContent.match(
        /csrf[_-]token['"]\s*:\s*['"]([^'"]+)['"]/i,
      );

      if (csrfMatch && csrfMatch[1]) {
        console.log("✅ CSRF token encontrado em script:", csrfMatch[1]);
        return csrfMatch[1];
      }

      console.error("⚠️ CSRF token não encontrado. Tentando extrair do cookie");

      const cookies = response.headers["set-cookie"];
      if (cookies) {
        const csrfCookie = cookies.find((cookie) => cookie.includes("csrf"));
        if (csrfCookie) {
          const cookieValue = csrfCookie.split(";")[0].split("=")[1];
          console.log("✅ CSRF token encontrado no cookie:", cookieValue);
          return cookieValue;
        }
      }

      console.error("❌ CSRF token não encontrado em nenhum local");
      console.error("HTML recebido (parcial):", html.slice(0, 1000));
      return null;
    } catch (error: any) {
      console.error(
        "❌ Erro ao buscar o CSRF token:",
        error.response?.data || error.message,
      );
      return null;
    }
  }

  public async authenticate(
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        console.error("Cannot authenticate with Kommo: API not configured");
        return false;
      }

      const csrfToken = await this.getCsrfToken();
      if (!csrfToken) {
        console.error("Failed to retrieve CSRF token");
        return false;
      }

      const response = await axios.post(
        "https://dicasaindaial.kommo.com/oauth2/authorize",
        {
          username,
          password,
          csrf_token: csrfToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
          },
        },
      );

      if (response.status === 200 && response.data?.access_token) {
        console.log("Authenticated successfully");
        return true;
      }

      console.error("Authentication failed:", response.data);
      return false;
    } catch (error: any) {
      console.error(
        "Error authenticating with Kommo:",
        error.response?.data || error.message,
      );
      return false;
    }
  }

  /**
   * Verifica se o token está válido e o renova se necessário
   */
  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken || !this.refreshToken) {
      console.error("No tokens available for Kommo API");
      return false;
    }

    // Se o token ainda é válido, não faça nada
    if (this.tokenExpiresAt > Date.now()) {
      return true;
    }

    // Renovar token expirado
    try {
      const response = await axios.post(
        "https://dicasaindaial.kommo.com/oauth2/access_token",
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        },
      );

      if (response.data.access_token) {
        this.setTokens(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in,
        );
        return true;
      } else {
        console.error("Failed to refresh Kommo token");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing Kommo token:", error);
      this.accessToken = null;
      this.refreshToken = null;
      return false;
    }
  }
}

export const kommoApi = new KommoAPI();
