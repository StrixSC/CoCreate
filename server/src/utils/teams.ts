const mascots: Record<string, string> = {
    'tiger': 'Tigre',
    'lion': 'Lion',
    'elephant': 'Éléphant',
    'walrus': 'Morse',
    'gorilla': 'Gorille',
    'cobra': 'Cobra',
    'zebra': 'Zebre',
    'horse': 'Cheval',
    'eagle': 'Aigle'
}

export const mascotTranslator = (mascot: string) => {
    if (mascots[mascot]) {
        return mascots[mascot].toLowerCase();
    } else return "";
}