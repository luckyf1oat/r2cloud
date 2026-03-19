/**
 * 检查用户是否有权限写入指定路径
 */
export function get_auth_status(context) {
    const dopath = context.request.url.split("/api/write/items/")[1] || "";
    if (context.env["GUEST"]) {
        if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;
        const allow_guest = context.env["GUEST"].split(",");
        for (const aa of allow_guest) {
            if (aa === "*" || dopath.startsWith(aa)) {
                return true;
            }
        }
    }

    const account = getAccountFromRequest(context.request);
    if (!account || !context.env[account]) return false;
    if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;

    const allow = context.env[account].split(",");
    for (const a of allow) {
        if (a === "*" || dopath.startsWith(a)) {
            return true;
        }
    }
    return false;
}

/**
 * 检查用户是否有权限读取指定路径
 * 支持读取权限配置，若无读权限则需要写入权限代替
 */
export function get_auth_status_for_read(context, filePath) {
    // 系统文件总是允许读取（需要写入权限验证）
    if (filePath.startsWith("_$flaredrive$/")) {
        return check_user_permission(context, filePath);
    }

    // 游客可以读取 GUEST 目录下的文件
    if (context.env["GUEST"]) {
        const allow_guest = context.env["GUEST"].split(",");
        for (var path of allow_guest) {
            if (path === "*" || filePath.startsWith(path)) {
                return true;
            }
        }
    }

    // 已认证用户可以读取其有权限的目录下的文件
    return check_user_permission(context, filePath);
}

/**
 * 检查认证用户的权限
 */
function check_user_permission(context, filePath) {
    const account = getAccountFromRequest(context.request);
    if (!account || !context.env[account]) return false;

    const allow = context.env[account].split(",");
    for (const path of allow) {
        if (path === "*" || filePath.startsWith(path)) {
            return true;
        }
    }

    return false;
}

function getAccountFromRequest(request) {
    const headers = new Headers(request.headers);
    const authHeader = headers.get("Authorization");
    const directToken = parseBasicToken(authHeader);
    if (directToken) {
        const account = decodeBase64Safe(directToken);
        if (account) return account;
    }

    const cookieHeader = headers.get("Cookie") || "";
    const cookieToken = getCookieValue(cookieHeader, "auth");
    if (cookieToken) {
        const account = decodeBase64Safe(cookieToken);
        if (account) return account;
    }

    return null;
}

function parseBasicToken(authHeader) {
    if (!authHeader) return null;
    const match = authHeader.match(/^Basic\s+(.+)$/i);
    return match?.[1] || null;
}

function getCookieValue(cookieHeader, name) {
    const segments = cookieHeader.split(";");
    for (const segment of segments) {
        const [k, ...rest] = segment.trim().split("=");
        if (k === name) {
            const value = rest.join("=");
            try {
                return decodeURIComponent(value);
            } catch (_e) {
                return value;
            }
        }
    }
    return null;
}

function decodeBase64Safe(value) {
    try {
        return atob(value);
    } catch (_e) {
        return null;
    }
}

  