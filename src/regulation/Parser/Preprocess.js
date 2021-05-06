/**
 * @param {string} string 
 */
const normalizeLevel1Heading = string => {
    return string.replace(/^(.+)\n={3,}/, '# $1')
}

/**
 * @param {string} string 
 */
const normalizeIndent = string => {
    return string.replace(/ {4}/gm, "\t")
}

/**
 * @param {string} string 
 */
const normalizeList = string => {
    return string.replace(/[0-9]+. (.+)/gm, '- $1')
        .replace(/\* (.+)/gm, '- $1')
}

/**
 * @param {string} string 
 */
const removeEmptyLine = string => {
    return string.replace(/^((\r\n|\n|\r)$)|(^(\r\n|\n|\r))|^\s*$/gm, "")
}

/**
 * @param {string} string 
 */
const normalize = (string) =>
    removeEmptyLine(normalizeList(normalizeIndent(normalizeLevel1Heading(string))));

export default { normalize };
