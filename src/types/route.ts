export type RouteTitle = string | ((productName?: string) => string)

export type AppHandle = {
  title: RouteTitle
}
