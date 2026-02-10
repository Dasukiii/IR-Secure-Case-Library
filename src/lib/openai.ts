import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

export interface CaseContext {
    title: string;
    type: 'ER' | 'IR';
    severity: string;
    status: string;
    description: string;
    parties: string[];
    timeline?: string[];
    evidence?: string[];
    nextStepsCompleted?: string[];
}

export interface AIResponse {
    content: string;
    error?: string;
}

export interface NextStepsResponse {
    steps: string[];
    error?: string;
}

export interface OutcomeResponse {
    settlement_notes: string;
    what_worked: string;
    what_to_improve: string;
    lesson_tags: string[];
    error?: string;
}

/**
 * Generate a professional summary of a case
 */
export async function generateCaseSummary(caseContext: CaseContext): Promise<AIResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an HR/IR specialist assistant with expertise in Malaysian employment law, helping to summarize employee relations and industrial relations cases.
                    Provide concise, professional summaries suitable for management review.
                    Focus on key facts, parties involved, current status, and any relevant Malaysian employment law considerations.
                    Use **bold** formatting for important terms and law references.
                    Keep the summary to 2-3 paragraphs maximum.`
                },
                {
                    role: 'user',
                    content: `Please summarize this ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case in the context of Malaysian employment law:

Title: ${caseContext.title}
Severity: ${caseContext.severity}
Status: ${caseContext.status}
Parties Involved: ${caseContext.parties.join(', ')}

Description:
${caseContext.description}

${caseContext.timeline?.length ? `Timeline Events:\n${caseContext.timeline.join('\n')}` : ''}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return {
            content: response.choices[0]?.message?.content || 'Unable to generate summary'
        };
    } catch (error) {
        console.error('AI Summary Error:', error);
        return {
            content: '',
            error: error instanceof Error ? error.message : 'Failed to generate summary'
        };
    }
}

/**
 * Generate suggested next steps for a case (text format)
 */
export async function generateNextSteps(caseContext: CaseContext): Promise<AIResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an experienced HR/IR consultant providing actionable next steps for case management.
                    Provide 3-5 specific, actionable recommendations based on best practices.
                    Consider legal compliance, documentation requirements, and stakeholder communication.
                    Format each step with a clear action verb and brief explanation.`
                },
                {
                    role: 'user',
                    content: `Based on this ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case, what are the recommended next steps?

Title: ${caseContext.title}
Severity: ${caseContext.severity}
Current Status: ${caseContext.status}
Parties: ${caseContext.parties.join(', ')}

Description:
${caseContext.description}

Please provide specific, actionable next steps for handling this case.`
                }
            ],
            temperature: 0.7,
            max_tokens: 600
        });

        return {
            content: response.choices[0]?.message?.content || 'Unable to generate recommendations'
        };
    } catch (error) {
        console.error('AI Next Steps Error:', error);
        return {
            content: '',
            error: error instanceof Error ? error.message : 'Failed to generate next steps'
        };
    }
}

/**
 * Generate structured next steps list for checklist
 */
export async function generateNextStepsList(caseContext: CaseContext): Promise<NextStepsResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an experienced HR/IR consultant. Generate a list of actionable next steps.
                    Return ONLY a JSON array of strings, each being a concise task (max 60 characters).
                    Example: ["Interview the complainant", "Review company policy", "Schedule mediation meeting"]
                    Generate 4-6 specific, actionable steps based on the case context.`
                },
                {
                    role: 'user',
                    content: `Generate a checklist of next steps for this ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case:

Title: ${caseContext.title}
Severity: ${caseContext.severity}
Current Status: ${caseContext.status}
Parties: ${caseContext.parties.join(', ')}

Description:
${caseContext.description}

${caseContext.timeline?.length ? `Recent Activity:\n${caseContext.timeline.slice(0, 3).join('\n')}` : ''}

Return ONLY a JSON array of actionable step strings.`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const content = response.choices[0]?.message?.content || '[]';

        // Parse JSON from response
        try {
            // Try to extract JSON array from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const steps = JSON.parse(jsonMatch[0]) as string[];
                return { steps };
            }
            // Fallback: split by newlines and clean up
            const steps = content
                .split('\n')
                .map(s => s.replace(/^[\d\.\-\*\s]+/, '').trim())
                .filter(s => s.length > 0 && s.length < 100);
            return { steps };
        } catch {
            return { steps: [], error: 'Failed to parse response' };
        }
    } catch (error) {
        console.error('AI Next Steps List Error:', error);
        return {
            steps: [],
            error: error instanceof Error ? error.message : 'Failed to generate next steps'
        };
    }
}

/**
 * Analyze case for risk assessment
 */
export async function analyzeRisk(caseContext: CaseContext): Promise<AIResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a legal and HR risk assessment specialist with expertise in Malaysian employment law.
                    Analyze cases for potential legal, reputational, and operational risks under Malaysian law.

                    IMPORTANT: Format your response exactly as follows:

                    **Key Risks:**
                    1. [First risk - be specific and concise]
                    2. [Second risk - be specific and concise]

                    **Recommended Mitigation Strategies:**
                    1. [First strategy - actionable and specific]
                    2. [Second strategy - actionable and specific]

                    **Relevant Malaysian Law:**
                    [Cite specific Malaysian employment laws that apply, such as Employment Act 1955, Industrial Relations Act 1967, etc.]

                    Keep the response concise - exactly 2 risks and 2 mitigation strategies.`
                },
                {
                    role: 'user',
                    content: `Please provide a risk assessment for this ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case under Malaysian employment law:

Title: ${caseContext.title}
Severity: ${caseContext.severity}
Status: ${caseContext.status}
Parties: ${caseContext.parties.join(', ')}

Description:
${caseContext.description}

Provide exactly 2 key risks and 2 mitigation strategies, with reference to relevant Malaysian employment laws.`
                }
            ],
            temperature: 0.7,
            max_tokens: 400
        });

        return {
            content: response.choices[0]?.message?.content || 'Unable to analyze risks'
        };
    } catch (error) {
        console.error('AI Risk Analysis Error:', error);
        return {
            content: '',
            error: error instanceof Error ? error.message : 'Failed to analyze risks'
        };
    }
}

/**
 * Generate lessons learned from a resolved case
 */
export async function generateLessonsLearned(
    caseContext: CaseContext,
    outcome: string,
    whatWorked?: string,
    whatToImprove?: string
): Promise<AIResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an HR/IR knowledge management specialist helping to extract institutional knowledge from resolved cases.
                    Focus on actionable insights that can help with similar future cases.
                    Provide clear, concise lessons that can be easily referenced.
                    Include both process improvements and best practices.`
                },
                {
                    role: 'user',
                    content: `Extract key lessons learned from this resolved ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case:

Title: ${caseContext.title}
Type: ${caseContext.type}
Severity: ${caseContext.severity}

Description:
${caseContext.description}

Outcome:
${outcome}

${whatWorked ? `What Worked Well:\n${whatWorked}` : ''}
${whatToImprove ? `Areas for Improvement:\n${whatToImprove}` : ''}

Please provide 3-5 key lessons learned that would help handle similar cases in the future.`
                }
            ],
            temperature: 0.7,
            max_tokens: 600
        });

        return {
            content: response.choices[0]?.message?.content || 'Unable to generate lessons'
        };
    } catch (error) {
        console.error('AI Lessons Error:', error);
        return {
            content: '',
            error: error instanceof Error ? error.message : 'Failed to generate lessons'
        };
    }
}

/**
 * Search for similar cases (semantic search helper)
 */
export async function generateSearchQuery(userQuery: string): Promise<AIResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a search query optimizer for an HR case management system.
                    Given a natural language query, extract key terms and concepts for searching.
                    Return a comma-separated list of relevant search terms and synonyms.`
                },
                {
                    role: 'user',
                    content: `Convert this search query into optimized search terms: "${userQuery}"`
                }
            ],
            temperature: 0.3,
            max_tokens: 100
        });

        return {
            content: response.choices[0]?.message?.content || userQuery
        };
    } catch (error) {
        console.error('AI Search Error:', error);
        return {
            content: userQuery,
            error: error instanceof Error ? error.message : 'Failed to optimize search'
        };
    }
}

/**
 * Generate comprehensive outcome and lessons from all case context
 */
export async function generateOutcome(caseContext: CaseContext): Promise<OutcomeResponse> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an HR/IR specialist helping to document case outcomes and lessons learned.
                    Based on all available case information, generate a comprehensive outcome analysis.
                    Return ONLY a valid JSON object with this exact structure:
                    {
                        "settlement_notes": "summary of resolution and outcome",
                        "what_worked": "what processes or approaches worked well",
                        "what_to_improve": "areas that could be improved for future cases",
                        "lesson_tags": ["tag1", "tag2", "tag3"]
                    }
                    The lesson_tags should be 3-5 short tags that categorize the key learnings.`
                },
                {
                    role: 'user',
                    content: `Generate an outcome analysis for this ${caseContext.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'} case:

Title: ${caseContext.title}
Type: ${caseContext.type}
Severity: ${caseContext.severity}
Status: ${caseContext.status}

Description:
${caseContext.description}

Parties Involved:
${caseContext.parties.join(', ')}

${caseContext.timeline?.length ? `Timeline/Activity:\n${caseContext.timeline.join('\n')}` : ''}

${caseContext.evidence?.length ? `Evidence Collected:\n${caseContext.evidence.join('\n')}` : ''}

${caseContext.nextStepsCompleted?.length ? `Steps Completed:\n${caseContext.nextStepsCompleted.join('\n')}` : ''}

Based on all this information, generate a comprehensive outcome analysis as a JSON object.`
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        const content = response.choices[0]?.message?.content || '{}';

        try {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    settlement_notes: parsed.settlement_notes || '',
                    what_worked: parsed.what_worked || '',
                    what_to_improve: parsed.what_to_improve || '',
                    lesson_tags: parsed.lesson_tags || []
                };
            }
            return {
                settlement_notes: '',
                what_worked: '',
                what_to_improve: '',
                lesson_tags: [],
                error: 'Failed to parse response'
            };
        } catch {
            return {
                settlement_notes: '',
                what_worked: '',
                what_to_improve: '',
                lesson_tags: [],
                error: 'Failed to parse JSON response'
            };
        }
    } catch (error) {
        console.error('AI Outcome Error:', error);
        return {
            settlement_notes: '',
            what_worked: '',
            what_to_improve: '',
            lesson_tags: [],
            error: error instanceof Error ? error.message : 'Failed to generate outcome'
        };
    }
}
