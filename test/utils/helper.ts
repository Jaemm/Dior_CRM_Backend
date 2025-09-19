export const findMissingFields = (obj1: any, obj2: any, currentPath = ''): string[] => {
    const missingFields: string[] = [];

    if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
        if (obj1 !== obj2) {
            return [currentPath];
        }
        return [];
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return [currentPath];
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    for (const key of keys1) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (!keys2.includes(key)) {
            missingFields.push(newPath);
        } else {
            const val1 = obj1[key];
            const val2 = obj2[key];

            if (typeof val1 === 'object' && typeof val2 === 'object') {
                const subMissingFields = findMissingFields(val1, val2, newPath);
                missingFields.push(...subMissingFields);
            }
        }
    }

    return missingFields;
};
