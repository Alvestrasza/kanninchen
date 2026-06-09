// Meta
// Version: 0.1.0
// Created: 2026-06-09
// Updated: 2026-06-09
// Purpose: Extract and normalize Kaninchen app roles from Keycloak tokens.

export type AppRole = "child" | "parent" | "admin" | "tester";

type JwtPayload = {
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
  roles?: string[];
  groups?: string[];
};

type ResolveAppRolesInput = {
  idToken?: string | null;
  accessToken?: string | null;
  clientId?: string | null;
};

const ROLE_ALIASES: Record<string, AppRole> = {
  child: "child",
  rabbit_child: "child",
  "kanninchen:child": "child",

  parent: "parent",
  guardian: "parent",
  rabbit_parent: "parent",
  "kanninchen:parent": "parent",

  admin: "admin",
  rabbit_admin: "admin",
  "kanninchen:admin": "admin",

  tester: "tester",
  rabbit_tester: "tester",
  "kanninchen:tester": "tester",
};

function decodeJwtPayload(token?: string | null): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalizedPayload, "base64").toString("utf8");

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function collectRawRoles(payload: JwtPayload | null, clientId?: string | null): string[] {
  if (!payload) {
    return [];
  }

  const realmRoles = payload.realm_access?.roles ?? [];
  const directRoles = payload.roles ?? [];
  const groups = payload.groups ?? [];

  const clientRoles = clientId
    ? payload.resource_access?.[clientId]?.roles ?? []
    : [];

  return [...realmRoles, ...clientRoles, ...directRoles, ...groups];
}

function normalizeRole(rawRole: string): AppRole | null {
  const normalized = rawRole
    .trim()
    .toLowerCase()
    .replace(/^\//, "");

  return ROLE_ALIASES[normalized] ?? null;
}

export function resolveAppRolesFromTokens({
  idToken,
  accessToken,
  clientId,
}: ResolveAppRolesInput): AppRole[] {
  const idPayload = decodeJwtPayload(idToken);
  const accessPayload = decodeJwtPayload(accessToken);

  const rawRoles = [
    ...collectRawRoles(idPayload, clientId),
    ...collectRawRoles(accessPayload, clientId),
  ];

  const roles = new Set<AppRole>();

  for (const rawRole of rawRoles) {
    const role = normalizeRole(rawRole);

    if (role) {
      roles.add(role);
    }
  }

  return [...roles];
}

export function hasAnyAppRole(roles: AppRole[], allowedRoles: AppRole[]): boolean {
  return allowedRoles.some((role) => roles.includes(role));
}