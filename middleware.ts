import { NextResponse, type NextRequest } from "next/server";

const OLD_HOSTS = new Set(["archimedes.life", "www.archimedes.life"]);
const NEW_HOST = "vibeleverage.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (host === `www.${NEW_HOST}`) {
    const destination = request.nextUrl.clone();
    destination.protocol = "https";
    destination.hostname = NEW_HOST;
    destination.port = "";
    return NextResponse.redirect(destination, 308);
  }

  if (host && OLD_HOSTS.has(host) && request.nextUrl.pathname !== "/migrate") {
    const migration = request.nextUrl.clone();
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    migration.pathname = "/migrate";
    migration.search = "";
    migration.searchParams.set("next", next);
    return NextResponse.redirect(migration, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
