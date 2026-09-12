import { connectedRun } from "@/lib/server/connected";
import { apiFailure, privateJson, readMutation } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET() { try { return privateJson(await connectedRun()); } catch (error) { return apiFailure(error); } }
export async function POST(request: Request) { try { return privateJson(await connectedRun(await readMutation(request))); } catch (error) { return apiFailure(error); } }
