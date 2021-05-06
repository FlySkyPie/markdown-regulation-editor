import OdtAttributes from './OdtAttributes';

/**
 * @param {{name:string}[]} children 
 */
export const rootJson = children => ({
    name: 'office:document-content',
    attrs: OdtAttributes,
    children: [{
        name: 'office:body',
        children: [{
            name: 'office:text',
            children: [{
                name: 'text:section',
                children: children
            }],
        }]
    },],
});

/**
 * @param {string} name 
 */
export const makeTitleText = name => ({
    name: 'text:p',
    text: name,
    attrs: {
        "text:style-name": "法規標題",
    }
})

/**
 * @param {string[]} histories 
 */
export const makeHistoryText = histories => {
    const newItems = [];
    histories.forEach(item => {
        newItems.push(item, { name: 'text:line-break' });
    })
    return {
        name: 'text:p',
        attrs: {
            "text:style-name": "法規歷程",

        },
        children: newItems
    }
}