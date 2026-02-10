import html2pdf from 'html2pdf.js';
import type { Case } from '../types';

interface CaseExportData {
    id: string;
    title: string;
    type: 'ER' | 'IR';
    severity: string;
    status: string;
    description: string;
    parties: string[];
    key_dates: {
        reported_date?: string;
        incident_date?: string;
        resolution_date?: string;
    };
    created_by: string;
    created_at: string;
    updated_at?: string;
    ai_summary?: string;
    ai_risk_analysis?: string;
    timeline?: Array<{
        event_type: string;
        description: string;
        event_date: string;
    }>;
    evidence?: Array<{
        document_name: string;
        document_type: string;
        uploaded_at: string;
    }>;
    next_steps?: Array<{
        title: string;
        completed: boolean;
        source: string;
    }>;
    outcome?: {
        outcome_type?: string;
        resolution_date?: string;
        settlement_notes?: string;
        what_worked?: string;
        what_to_improve?: string;
        lesson_tags?: string[];
    };
}

/**
 * Generate a professional PDF report for a single case
 */
export async function exportCaseToPDF(caseData: CaseExportData): Promise<void> {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const completedSteps = caseData.next_steps?.filter(s => s.completed).length || 0;
    const totalSteps = caseData.next_steps?.length || 0;

    const html = `
        <div style="font-family: 'Inter', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <!-- Header -->
            <div style="border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 8px 0;">${caseData.title}</h1>
                        <div style="display: flex; gap: 16px; align-items: center;">
                            <span style="
                                background: ${caseData.type === 'ER' ? '#dbeafe' : '#f3e8ff'};
                                color: ${caseData.type === 'ER' ? '#1d4ed8' : '#7c3aed'};
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                            ">${caseData.type === 'ER' ? 'Employee Relations' : 'Industrial Relations'}</span>
                            <span style="
                                background: ${getSeverityColor(caseData.severity)};
                                color: white;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                            ">${caseData.severity}</span>
                            <span style="
                                background: ${getStatusColor(caseData.status)};
                                color: white;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                            ">${caseData.status}</span>
                        </div>
                    </div>
                    <div style="text-align: right; color: #64748b; font-size: 12px;">
                        <div>Case #${caseData.id.slice(0, 8)}</div>
                        <div>Generated: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <!-- Key Dates -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0;">Key Dates</h2>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Date Reported</div>
                        <div style="color: #0f172a; font-weight: 600;">${formatDate(caseData.key_dates?.reported_date)}</div>
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Date of Incident</div>
                        <div style="color: #0f172a; font-weight: 600;">${formatDate(caseData.key_dates?.incident_date)}</div>
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Resolution Date</div>
                        <div style="color: #0f172a; font-weight: 600;">${formatDate(caseData.key_dates?.resolution_date)}</div>
                    </div>
                    <div>
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Last Updated</div>
                        <div style="color: #0f172a; font-weight: 600;">${formatDate(caseData.updated_at)}</div>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div style="margin-bottom: 24px;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Case Description</h2>
                <p style="color: #475569; line-height: 1.6; margin: 0;">${caseData.description || 'No description provided.'}</p>
            </div>

            <!-- Parties Involved -->
            <div style="margin-bottom: 24px;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Parties Involved</h2>
                ${caseData.parties && caseData.parties.length > 0 ? `
                <ul style="margin: 0; padding-left: 20px; color: #475569;">
                    ${caseData.parties.map(party => `<li style="margin-bottom: 4px;">${party}</li>`).join('')}
                </ul>
                ` : '<p style="color: #94a3b8; margin: 0;">No parties specified.</p>'}
            </div>

            <!-- AI Summary -->
            ${caseData.ai_summary ? `
            <div style="margin-bottom: 24px; background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 8px;">
                <h2 style="color: #0369a1; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">AI-Generated Summary</h2>
                <p style="color: #0c4a6e; line-height: 1.6; margin: 0;">${caseData.ai_summary}</p>
            </div>
            ` : ''}

            <!-- AI Risk Analysis -->
            ${caseData.ai_risk_analysis ? `
            <div style="margin-bottom: 24px; background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px;">
                <h2 style="color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Risk Analysis</h2>
                <p style="color: #78350f; line-height: 1.6; margin: 0;">${caseData.ai_risk_analysis}</p>
            </div>
            ` : ''}

            <!-- Next Steps / Checklist -->
            ${caseData.next_steps && caseData.next_steps.length > 0 ? `
            <div style="margin-bottom: 24px;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Next Steps (${completedSteps}/${totalSteps} completed)</h2>
                <div style="background: #f8fafc; border-radius: 8px; overflow: hidden;">
                    ${caseData.next_steps.map(step => `
                        <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;">
                            <span style="
                                width: 20px;
                                height: 20px;
                                border-radius: 4px;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 12px;
                                ${step.completed
            ? 'background: #10b981; color: white;'
            : 'background: white; border: 2px solid #cbd5e1;'
        }
                            ">${step.completed ? '✓' : ''}</span>
                            <span style="color: ${step.completed ? '#94a3b8' : '#334155'}; ${step.completed ? 'text-decoration: line-through;' : ''}">${step.title}</span>
                            ${step.source === 'ai' ? '<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-size: 10px;">AI</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Evidence -->
            ${caseData.evidence && caseData.evidence.length > 0 ? `
            <div style="margin-bottom: 24px;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Evidence & Documents (${caseData.evidence.length} files)</h2>
                <div style="background: #f8fafc; border-radius: 8px; overflow: hidden;">
                    ${caseData.evidence.map(doc => `
                        <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: #334155; font-weight: 500;">${doc.document_name}</div>
                                <div style="color: #94a3b8; font-size: 12px;">${doc.document_type}</div>
                            </div>
                            <div style="color: #94a3b8; font-size: 12px;">${formatDate(doc.uploaded_at)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${caseData.timeline && caseData.timeline.length > 0 ? `
            <!-- Timeline -->
            <div style="margin-bottom: 24px; page-break-before: auto;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Timeline (${caseData.timeline.length} events)</h2>
                <div style="border-left: 2px solid #e2e8f0; padding-left: 20px;">
                    ${caseData.timeline.map(event => `
                        <div style="margin-bottom: 16px; position: relative;">
                            <div style="
                                position: absolute;
                                left: -26px;
                                top: 4px;
                                width: 10px;
                                height: 10px;
                                background: #0284c7;
                                border-radius: 50%;
                            "></div>
                            <div style="color: #64748b; font-size: 12px;">${formatDate(event.event_date)}</div>
                            <div style="color: #0f172a; font-weight: 500;">${event.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${caseData.outcome ? `
            <!-- Outcome & Lessons -->
            <div style="margin-bottom: 24px; page-break-before: auto;">
                <h2 style="color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">Outcome & Lessons Learned</h2>
                
                ${caseData.outcome.outcome_type ? `
                <div style="margin-bottom: 16px;">
                    <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Outcome Type</div>
                    <p style="color: #0f172a; font-weight: 600; margin: 0;">${caseData.outcome.outcome_type}</p>
                </div>
                ` : ''}

                ${caseData.outcome.settlement_notes ? `
                <div style="margin-bottom: 16px;">
                    <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">Resolution Summary</div>
                    <p style="color: #475569; margin: 0;">${caseData.outcome.settlement_notes}</p>
                </div>
                ` : ''}
                
                ${caseData.outcome.what_worked ? `
                <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="color: #166534; font-weight: 600; margin-bottom: 8px;">✓ What Worked Well</div>
                    <p style="color: #166534; margin: 0;">${caseData.outcome.what_worked}</p>
                </div>
                ` : ''}
                
                ${caseData.outcome.what_to_improve ? `
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="color: #92400e; font-weight: 600; margin-bottom: 8px;">△ Areas for Improvement</div>
                    <p style="color: #92400e; margin: 0;">${caseData.outcome.what_to_improve}</p>
                </div>
                ` : ''}

                ${caseData.outcome.lesson_tags && caseData.outcome.lesson_tags.length > 0 ? `
                <div style="margin-top: 16px;">
                    <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">Lesson Tags</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${caseData.outcome.lesson_tags.map(tag => `
                            <span style="
                                background: #f1f5f9;
                                color: #475569;
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                            ">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; color: #94a3b8; font-size: 11px; text-align: center;">
                <div>IR Secure Case Library • Confidential Document</div>
                <div>Created ${formatDate(caseData.created_at)}</div>
            </div>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    const options = {
        margin: [10, 10] as [number, number],
        filename: `Case_${caseData.id.slice(0, 8)}_${caseData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
        await html2pdf().set(options).from(element).save();
    } finally {
        document.body.removeChild(element);
    }
}

/**
 * Export multiple cases as a list PDF
 */
export async function exportCaseListToPDF(cases: Case[]): Promise<void> {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const statusCounts = {
        Open: cases.filter(c => c.status === 'Open').length,
        Pending: cases.filter(c => c.status === 'Pending').length,
        Closed: cases.filter(c => c.status === 'Closed').length
    };

    const html = `
        <div style="font-family: 'Inter', Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto;">
            <!-- Header -->
            <div style="border-bottom: 3px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 8px 0;">Case List Report</h1>
                        <p style="color: #64748b; margin: 0;">IR Secure Case Library</p>
                    </div>
                    <div style="text-align: right; color: #64748b; font-size: 12px;">
                        <div>Generated: ${new Date().toLocaleDateString()}</div>
                        <div>Total Cases: ${cases.length}</div>
                    </div>
                </div>
            </div>

            <!-- Summary Stats -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #0f172a;">${cases.length}</div>
                    <div style="font-size: 12px; color: #64748b;">Total Cases</div>
                </div>
                <div style="background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${statusCounts.Open}</div>
                    <div style="font-size: 12px; color: #64748b;">Open</div>
                </div>
                <div style="background: #fefce8; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #ca8a04;">${statusCounts.Pending}</div>
                    <div style="font-size: 12px; color: #64748b;">Pending</div>
                </div>
                <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #16a34a;">${statusCounts.Closed}</div>
                    <div style="font-size: 12px; color: #64748b;">Closed</div>
                </div>
            </div>

            <!-- Case Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Case Title</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 60px;">Type</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 70px;">Severity</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 70px;">Status</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; width: 100px;">Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${cases.map(caseItem => `
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                                <div style="font-weight: 500; color: #0f172a;">${caseItem.title}</div>
                                <div style="color: #94a3b8; font-size: 11px;">${caseItem.parties?.slice(0, 2).join(', ') || 'No parties'}</div>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                                <span style="color: ${caseItem.type === 'ER' ? '#1d4ed8' : '#7c3aed'}; font-weight: 500;">${caseItem.type}</span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                                <span style="
                                    background: ${getSeverityColor(caseItem.severity)};
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                ">${caseItem.severity}</span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                                <span style="
                                    background: ${getStatusColor(caseItem.status)};
                                    color: white;
                                    padding: 2px 8px;
                                    border-radius: 12px;
                                    font-size: 11px;
                                ">${caseItem.status}</span>
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">
                                ${formatDate(caseItem.created_at)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; color: #94a3b8; font-size: 11px; text-align: center;">
                <div>IR Secure Case Library • Confidential Document</div>
                <div>Page 1</div>
            </div>
        </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    const options = {
        margin: [10, 10] as [number, number],
        filename: `Case_List_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
        await html2pdf().set(options).from(element).save();
    } finally {
        document.body.removeChild(element);
    }
}

function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'Critical': return '#dc2626';
        case 'High': return '#ea580c';
        case 'Medium': return '#ca8a04';
        case 'Low': return '#16a34a';
        default: return '#64748b';
    }
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'Open': return '#0284c7';
        case 'Pending': return '#ca8a04';
        case 'Closed': return '#16a34a';
        default: return '#64748b';
    }
}
