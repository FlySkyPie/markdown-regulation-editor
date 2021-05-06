
/**
 * Find level-1 headings.
 * @param {string} regulationString 
 */
const takeName = (regulationString) => {
    const pattern = /^# (.+)(?:\n|$)/m;
    const result = regulationString.match(pattern);
    if (result === null) {
        throw new Error('The name of regulation not found.');
    }
    return {
        name: result[1],
        content: regulationString.replace(pattern, ""),
    };
}

/**
 * Find level-6 headings.
 * @param {string} regulationString 
 */
const takeHistories = (regulationString) => {
    const pattern = /^#{6} (.+)(?:\n|$|\r\n)/gm;
    const result = [...regulationString.matchAll(pattern)];
    if (result.length === 0) {
        throw new Error('Histories not found.');
    }/**/

    return {
        histories: result.map(value => value[1]),
        content: regulationString.replace(pattern, ""),
    };
}

/**
 * @param {string} regulationString 
 */
const removeListTag = (regulationString) => {
    return regulationString.replace(/^(\s*)- (.*)/gm, '$1$2')
}

/**
 * Add \t to each line except chapter, and remove ### from chapter title.
 * @param {string} regulationString 
 */
const normalizeChapters = (regulationString) => {
    if ([...regulationString.matchAll(/^((?:### ).*)$/gm)].length !== 0) {

        return {
            isChaptered: true,
            content: regulationString
                .replace(/^((?!### ).*)$/gm, "\t$1")
                .replace(/^(?:### )(.*)$/gm, '$1'),
        };
    }

    return {
        isChaptered: false,
        content: regulationString,
    };
}

/**
 * 
 * @param {string[]} lines 
 * @param {number} deep 
 */
const makeIndentTree = (lines, deep) => {
    if (lines.length === 0) {
        return [];
    }
    const groups = lines.reduce((tmp, line) => {
        if (line.match(/^\t/)) {
            tmp[tmp.length - 1].push(line)
            return tmp;
        } else {
            tmp.push([line])
            return tmp
        }
    }, [[]])

    const d = groups.slice(1, groups.length).map(section => {
        const [firstLine, ...lines] = section;
        const subLines = lines.map(line => line.replace(/^\t/gm, ""));
        return {
            value: firstLine,
            deep,
            subtree: makeIndentTree(subLines, deep + 1)
        }
    });

    return d;
}

/**
 * 
 * @param {string} regulationString 
 */
const parse = regulationString => {
    const { name, content: tmp1 } = takeName(regulationString);
    const { histories, content: tmp2 } = takeHistories(tmp1);
    const tmp3 = removeListTag(tmp2);
    const { isChaptered, content: tmp4 } = normalizeChapters(tmp3);
    const content = makeIndentTree(tmp4.split("\n"), isChaptered ? 1 : 2)

    return {
        name,
        histories,
        isChaptered,
        content,
    }
}

export default { parse, takeName, takeHistories, removeListTag };