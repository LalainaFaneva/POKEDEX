const listePoke = document.querySelector('.liste-poke');
const searchInput = document.querySelector('#recherche');
const loader = document.querySelector('.loader');

const POKE_DEBUT = 20;
let allPokemon = [];
let index = POKE_DEBUT;

const types = {
    bug:'#a8b820', dark:'#705848', dragon:'#7038f8', electric:'#f8d030',
    fairy:'#ee99ac', fighting:'#c03028', fire:'#f08030', flying:'#a890f0',
    ghost:'#705898', grass:'#78c850', ground:'#e0c068', ice:'#98d8d8',
    normal:'#a8a878', poison:'#a040a0', psychic:'#f85888', rock:'#b8a038',
    steel:'#b8b8d0', water:'#6890f0'
};

async function fetchPokemonBase() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!res.ok) throw new Error('API indisponible');
        const data = await res.json();

        const promises = data.results.map(p => fetchPokemonComplet(p));
        const results = await Promise.all(promises);

        allPokemon = results.filter(p => p !== null);
        allPokemon.sort((a,b) => a.id - b.id);

        createCard(allPokemon.slice(0, POKE_DEBUT));
    } catch (err) {
        console.error('Erreur lors du chargement des Pokémon :', err);
        listePoke.innerHTML = '<li style="color:red;">Impossible de charger les Pokémon pour l’instant.</li>';
    } finally {
        loader.style.display = 'none';
    }
}
async function fetchPokemonComplet(pokemon) {
    try {
        const res = await fetch(pokemon.url);
        if (!res.ok) throw new Error('Erreur fetch Pokémon');
        const data = await res.json();
        return {
            id: data.id,
            name: data.name,
            pic: data.sprites.front_default,
            type: data.types[0].type.name
        };
    } catch (err) {
        console.warn('Impossible de charger', pokemon.name, err);
        return null; 
    }
}

function createCard(arr){
    arr.forEach(poke => {
        const li = document.createElement('li');
        li.style.background = types[poke.type] || '#777';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '10px';
        li.style.padding = '10px';
        li.style.borderRadius = '8px';
        li.style.marginBottom = '5px';

        const img = document.createElement('img');
        img.src = poke.pic || '';
        img.alt = poke.name;

        const h5 = document.createElement('h5');
        h5.innerText = `#${poke.id} ${poke.name}`;

        li.appendChild(img);
        li.appendChild(h5);
        listePoke.appendChild(li);
    });
}

searchInput.addEventListener('input', e => {
    const value = e.target.value.toUpperCase();
    document.querySelectorAll('.liste-poke li').forEach(li => {
        li.style.display = li.innerText.toUpperCase().includes(value) ? 'flex' : 'none';
    });
});

let isLoading = false;
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50 && !isLoading) {
        isLoading = true;
        addPoke(6);
        setTimeout(() => { isLoading = false }, 300);
    }
});

function addPoke(nb){
    if(index >= allPokemon.length) return;
    createCard(allPokemon.slice(index, index + nb));
    index += nb;
}

fetchPokemonBase();
