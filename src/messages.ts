// messages.ts - Using the first approach (Enums with Constant Objects)
export enum MessageCategory {
    WORKFLOW_GUIDANCE = 'workflowGuidance',
    STATUS_INDICATORS = 'statusIndicators'
}

export const messages = {
    [MessageCategory.WORKFLOW_GUIDANCE]: {
        UPDATE_STATUS: 'Review and update the status to reflect the current stage of the note',
        ADD_DESCRIPTION: 'Ensure the description succinctly captures the main idea of the note',
        VERIFY_SOURCES: 'Verify all claims have proper sources cited (aim for at least 3 sources)',
        CREATE_ANKI: 'Create Anki cards for key concepts (minimum 3 recommended)',
        ADD_VISUAL: 'Add a visual element to enhance understanding (diagram, chart, or image)'
    },
    [MessageCategory.STATUS_INDICATORS]: {
        FOUND: '✅ Found',
        MISSING: '❌ Missing'
    }
};