/**
 * 统一的请求路由中间件
 * 同时支持 Cloudflare Workers 和 Pages 部署
 */

// 导入所有 API 处理器
import * as apiChildren from "./api/children/[[path]]";
import * as apiWrite from "./api/write/items/[[path]]";
import * as apiBuckets from "./api/buckets";
import * as rawFile from "./raw/[[path]]";

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // ==================== API 路由 ====================

    // GET /api/buckets - 获取存储桶信息
    if (pathname === "/api/buckets") {
      return await apiBuckets.onRequestGet?.({
        request,
        env,
        params: {},
      }) || notFound();
    }

    // GET /api/children/:path - 列表文件/文件夹
    if (pathname.startsWith("/api/children/")) {
      const path = pathname.replace("/api/children/", "");
      const pathParams = path ? path.split("/").filter(Boolean) : [];
      return await apiChildren.onRequestGet?.({
        request,
        env,
        params: { path: pathParams },
      }) || notFound();
    }

    // /api/write/items/:path - 文件上传、删除、移动
    if (pathname.startsWith("/api/write/items/")) {
      const path = pathname.replace("/api/write/items/", "");
      const pathParams = path ? path.split("/").filter(Boolean) : [];
      const ctx = { request, env, params: { path: pathParams } };

      if (request.method === "PUT") {
        return await apiWrite.onRequestPut?.(ctx) || notFound();
      } else if (request.method === "POST") {
        return await apiWrite.onRequestPost?.(ctx) || notFound();
      } else if (request.method === "DELETE") {
        return await apiWrite.onRequestDelete?.(ctx) || notFound();
      }
    }

    // GET /raw/:path - 读取原始文件
    if (pathname.startsWith("/raw/")) {
      const path = pathname.replace("/raw/", "");
      const pathParams = path ? path.split("/").filter(Boolean) : [];
      return await rawFile.onRequestGet?.({
        request,
        env,
        params: { path: pathParams },
      }) || notFound();
    }

    // ==================== 静态文件处理 ====================
    // Pages: 使用 context.next()
    if (context.next && typeof context.next === "function") {
      return context.next();
    }

    // Workers: 使用 ASSETS 绑定处理静态资源与 SPA 路由
    if ((request.method === "GET" || request.method === "HEAD") && env?.ASSETS?.fetch) {
      const staticResp = await env.ASSETS.fetch(request);
      if (staticResp.status !== 404) {
        return staticResp;
      }

      const spaUrl = new URL(request.url);
      spaUrl.pathname = "/index.html";
      const spaRequest = new Request(spaUrl.toString(), request);
      const spaResp = await env.ASSETS.fetch(spaRequest);
      if (spaResp.status !== 404) {
        return spaResp;
      }
    }

    return notFound();
  } catch (error: any) {
    console.error("[Middleware Error]", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function notFound() {
  return new Response(
    JSON.stringify({ error: "Not Found" }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// 导出默认 Worker
export default {
  fetch: async (request: Request, env: any, ctx: any) => {
    return onRequest({
      request,
      env,
      params: {},
    });
  },
};



