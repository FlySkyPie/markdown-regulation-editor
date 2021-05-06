import meta from '!!raw-loader!./template/meta.xml';
import manifest from '!!raw-loader!./template/manifest.xml';
import mimetype from '!!raw-loader!./template/mimetype';
import styles from '!!raw-loader!./template/styles.xml';
import testMarkdown from '!!raw-loader!./template/test.md';

import jsonxml from 'jsontoxml';
import JSZip from "jszip";

import { rootJson, makeTitleText, makeHistoryText } from './ContentMaker';
import Parser from "./Parser/Parser";
import Preprocess from "./Parser/Preprocess";

const startValue = value =>
    (value === undefined) ? "1" : value.toString();

/**
 * @typedef {object} regulationTree
 * @property {string} value
 * @property {number} deep
 * @property {regulationTree[]} subTree
 * 
 * @param {regulationTree[]} array 
 */
const makeJson = (array) => {
    if (array.length === 0) {
        return [];
    }
    return array.map((regObject, index) => {
        const xmlObj = {
            name: 'text:list-item',
            attrs: (index === 0 && regObject.deep === 2 ||
                regObject.beginIn !== undefined) ?
                { 'text:start-value': startValue(regObject.beginIn) } :
                undefined,
            children: [
                {
                    name: 'text:p',
                    attrs: {
                        'text:style-name': styleName(regObject.deep)
                    },
                    text: regObject.value
                },
                {
                    name: 'text:list',
                    children: makeJson(regObject.subtree)
                }
            ],
        };

        return xmlObj;
    })
}

/**
 * 
 * @param {regulationTree[]} array 
 */
const createChapteredXmlJson = array => {
    const indentTree = array.map((item, index) => {
        return {
            ...item,
            beginIn: array.slice(0, index).reduce((s, current) => s + current.subtree.length, 1)
        }
    }).map(item => {
        const { beginIn, ...others } = item;
        if (others.subtree !== undefined) {
            others.subtree[0].beginIn = beginIn;
        }
        return others;
    });
    return makeJson(indentTree);
}

const getTestMarkdown = () => {
    return testMarkdown;
}

const styleName = level => {
    switch (level) {
        case 1:
            return '法規章節（段落樣式）';
        case 2:
            return '法規條款（段落樣式）';
        default:
            return '法規項次（段落樣式）';
    }
}

const getContentString = (markdownString) => {
    const reg = Preprocess.normalize(markdownString);
    const result = Parser.parse(reg);
    const regulationListJson = [{
        name: 'text:list',
        children: result.isChaptered ?
            createChapteredXmlJson(result.content) :
            [{
                name: 'text:list-header',
                children: [{
                    name: 'text:list',
                    children: makeJson(result.content),
                }]
            }],
        attrs: {
            'text:style-name': "法規本文",
        },
    }];
    const content = rootJson([
        makeTitleText(result.name),
        makeHistoryText(result.histories),
        regulationListJson
    ]);

    return {
        name: result.name,
        content: '<?xml version="1.0" encoding="UTF-8"?>' + jsonxml([content]),
    }
}

const createOdtPromise = (markdownString) => {
    const result = getContentString(markdownString);
    const zip = new JSZip();
    zip.file("META-INF/manifest.xml", manifest);
    zip.file("meta.xml", meta);
    zip.file("mimetype", mimetype);
    zip.file("styles.xml", styles);
    zip.file("content.xml", result.content);

    return zip.generateAsync({ type: "uint8array" })
        .then(buffer => {
            return {
                name: result.name,
                buffer
            }
        });
}

export default { createOdtPromise, getTestMarkdown };