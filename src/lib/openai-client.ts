import { getDecryptedApiKey } from "@/services/organizations";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Create an OpenAI client instance for an organization
 *
 * @param organizationId - Organization ID
 * @returns OpenAI client configured with organization's API key
 *
 * @throws {Error} If organization has no API key configured
 *
 * @example
 * ```typescript
 * const openai = await createOrgOpenAIClient("org_123");
 * const model = openai.chat("gpt-4-turbo");
 * ```
 */
export async function createOrgOpenAIClient(organizationId: string) {
  const apiKey = await getDecryptedApiKey(organizationId);

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured for organization. Please configure it in Settings."
    );
  }

  return createOpenAI({
    apiKey,
  });
}
