import _ from 'lodash'
import { getStringWithLocale } from './locale'

export function mapKeywordSetToForm(keywordSets, id, locale = 'fi') {
    let keywordSet = _.findWhere(keywordSets, {'id': id})
    if(keywordSet && keywordSet.keywords) {
        return keywordSet.keywords.map((item) => {
            let label = getStringWithLocale(item, 'name', locale)
            return {
                value: item['@id'],
                label: label
            }
        })
    }

    else {
        return []
    }
}

export function mapLanguagesSetToForm(set, locale = 'fi') {
    if(set && set.length) {
        return set.map((item) => {
            let label = getStringWithLocale(item, 'name', locale, item.id)
            return {
                value: item['@id'],
                label: label
            }
        })
    }

    else {
        return []
    }
}
