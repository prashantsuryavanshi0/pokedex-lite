import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [offset, setOffset] = useState(0);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("fav")) || []
  );

  useEffect(() => {
    fetchPokemons();
  }, [offset]);

  const fetchPokemons = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
      );

      const data = await Promise.all(
        res.data.results.map(async (p) => {
          const details = await axios.get(p.url);
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

      setPokemons(data);
      setLoading(false);
    } catch (err) {
      setError("❌ Failed to load Pokémon");
      setLoading(false);
    }
  };

  const toggleFav = (pokemon) => {
    let updated;
    if (favorites.find((f) => f.name === pokemon.name)) {
      updated = favorites.filter((f) => f.name !== pokemon.name);
    } else {
      updated = [...favorites, pokemon];
    }
    setFavorites(updated);
    localStorage.setItem("fav", JSON.stringify(updated));
  };

  const filtered = pokemons
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      typeFilter ? p.types.includes(typeFilter) : true
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <h1 className="text-5xl font-bold text-center mb-8">
        Pokedex Lite 🔥
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Pokémon..."
        className="w-full p-3 mb-4 rounded-xl bg-white/10 backdrop-blur"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filter */}
      <select
        className="p-3 mb-6 rounded-xl bg-white/10 backdrop-blur"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="grass">Grass</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="bug">Bug</option>
      </select>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <motion.div
              key={p.name}
              whileHover={{ scale: 1.08 }}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center cursor-pointer"
              onClick={() => setSelectedPokemon(p)}
            >
              <img src={p.image} className="mx-auto w-24 h-24" />
              <h2 className="capitalize mt-2">{p.name}</h2>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(p);
                }}
                className="text-xl mt-2"
              >
                {favorites.find((f) => f.name === p.name)
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
        {selectedPokemon && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur p-6 rounded-xl w-80 text-center"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
            >
              <h2 className="text-2xl capitalize">
                {selectedPokemon.name}
              </h2>
              <img src={selectedPokemon.image} className="mx-auto" />

              <p>HP: {selectedPokemon.stats.hp}</p>
              <p>Attack: {selectedPokemon.stats.attack}</p>

              <button
                onClick={() => setSelectedPokemon(null)}
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