import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [activePokemon, setActivePokemon] = useState(null);
  const [offset, setOffset] = useState(0);

  const [favList, setFavList] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  useEffect(() => {
    loadPokemons();
  }, [offset]);

  const loadPokemons = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
      );

      const data = await Promise.all(
        res.data.results.map(async (item) => {
          const details = await axios.get(item.url);
          return {
            name: details.data.name,
            image: details.data.sprites.front_default,
            types: details.data.types.map((t) => t.type.name),
            stats: {
              hp: details.data.stats[0].base_stat,
              attack: details.data.stats[1].base_stat,
            },
          };
        })
      );

      setPokemonList(data);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg("Failed to load Pokémon data");
      setIsLoading(false);
    }
  };

  const handleFavorite = (pokemon) => {
    let updated;
    if (favList.find((f) => f.name === pokemon.name)) {
      updated = favList.filter((f) => f.name !== pokemon.name);
    } else {
      updated = [...favList, pokemon];
    }
    setFavList(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const filteredList = pokemonList
    .filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((p) =>
      selectedType ? p.types.includes(selectedType) : true
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl text-center mb-6 font-bold">
        My Pokedex App 🔥
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Pokémon..."
        className="w-full p-3 mb-4 rounded bg-gray-800 text-white border border-gray-600"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* FIXED DROPDOWN */}
      <select
        className="p-3 mb-6 rounded bg-gray-800 text-white border border-gray-600"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="grass">Grass</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="bug">Bug</option>
      </select>

      {/* Error */}
      {errorMsg && (
        <p className="text-red-400 text-center mb-4">{errorMsg}</p>
      )}

      {/* Loading */}
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredList.map((p) => (
            <motion.div
              key={p.name}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 p-4 rounded-lg text-center cursor-pointer"
              onClick={() => setActivePokemon(p)}
            >
              <img src={p.image} className="mx-auto w-24 h-24" />
              <h2 className="capitalize mt-2">{p.name}</h2>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(p);
                }}
                className="mt-2 text-xl"
              >
                {favList.find((f) => f.name === p.name)
                  ? "❤️"
                  : "🤍"}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setOffset((prev) => Math.max(prev - 20, 0))}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Prev
        </button>

        <button
          onClick={() => setOffset((prev) => prev + 20)}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activePokemon && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-80 text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl capitalize mb-2">
                {activePokemon.name}
              </h2>
              <img src={activePokemon.image} className="mx-auto mb-3" />

              <p>HP: {activePokemon.stats.hp}</p>
              <p>Attack: {activePokemon.stats.attack}</p>

              <button
                onClick={() => setActivePokemon(null)}
                className="mt-4 px-4 py-2 bg-red-500 rounded"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;