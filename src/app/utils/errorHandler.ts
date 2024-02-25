// src/app/utils/errorHandler.ts

export function errorHandler(res: Response, error: any) {
  console.error(error); // Log the error for server-side debugging.
  return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.toString() }), { status: 500 });
}
