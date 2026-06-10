import * as icons from '@phosphor-icons/react';
const targetIcons = ['Sneezing', 'MartialArts', 'Belt', 'GenderIntersex', 'Pill', 'Bandaids'];
targetIcons.forEach(name => {
    console.log(`${name} exists:`, !!icons[name]);
});
