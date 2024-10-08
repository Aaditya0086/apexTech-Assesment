import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getPokemonList,
  getPokemonDetails,
  getPokemonListOnSearch,
  getPokemonListLazy,
} from "../services/pokemon";
import { createUser } from "../services/user";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import PokemonSelectLazyScroll from "./PokemonSelectLazyScroll";

const CreatePokemonUserForm = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [abilities, setAbilities] = useState([]);

  const [ownerName, setOwnerName] = useState("");
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonAbility, setPokemonAbility] = useState("");
  const [initialPositionX, setInitialPositionX] = useState(0);
  const [initialPositionY, setInitialPositionY] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState("");
  const [noOfPokemon, setNoOfPokemon] = useState(1);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const limit = 40;

  const fetchPokemonList = useCallback(async (limit, offset) => {
    try {
      const response = await getPokemonListLazy(limit, offset);
      setPokemonList((prevList) => [...prevList, ...response.data.results]);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch Pokemon list:", err);
    }
  });

  const fetchPokemonAbility = useCallback(async (name) => {
    try {
      const response = await getPokemonDetails(name);
      return response;
    } catch (err) {
      console.error("Failed to fetch Pokemon ability:", err);
    }
  });

  useEffect(() => {
    if (pokemonName) {
      // console.log(pokemonName);
      fetchPokemonAbility(pokemonName)
        .then((response) => {
          // console.log(response);
          const abilities = response.data.abilities.map(
            (ability) => ability.ability.name
          );
          // console.log(abilities);
          setAbilities(abilities);
          if (abilities.length === 1) {
            setPokemonAbility(abilities[0]);
          } else {
            setPokemonAbility("Please Select a Pokemon Ability");
          }
        })
        .catch((error) => console.error("Error Fetching Pokemon Data", error));
    }
  }, [pokemonName]);

  useEffect(() => {
    fetchPokemonList(limit, offset);
  }, []);

  const handleCreatePokemonUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now().toString(),
      ownerName,
      noOfPokemon,
      pokemons: [
        {
          pokemonName,
          pokemonAbility,
          initialPositionX,
          initialPositionY,
          speed,
          direction,
        },
      ],
    };

    createUser(newUser)
      .then((response) => {
        console.log("User with Pokémon added:", response.data);
        navigate("/list");
      })
      .catch((error) => {
        console.error("Error adding user with Pokémon:", error);
      });
  };

  const handlePokemonNameChange = (selectedOption) => {
    setPokemonName(selectedOption.value);
  };

  const pokemonOptions = pokemonList.map((pokemon) => ({
    value: pokemon.name,
    label: pokemon.name,
  }));

  const handlePokemonNameScroll = useCallback(async () => {
    // alert('bottom');
    if (offset < 1302) {
      setLoading(true);
      setOffset((prevOffset) => {
        const newOffset = prevOffset + limit;
        fetchPokemonList(limit, newOffset);
        return newOffset;
      });
    } else {
      alert("All Pokemons listed");
    }
  });

  return (
    <div>
      <form>
        <input
          type="text"
          name="pokemonOwnerName"
          placeholder="Pokemon Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />

        {/* version-1 */}
        {/* <select
          name="pokemonName"
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
        >
          <option value="">Select Pokémon Name</option>
          {pokemonList.map((pokemon, index) => (
            <option key={index} value={pokemon.name}>
              {pokemon.name}
            </option>
          ))}
        </select> */}

        {/* version-2 */}
        {/* <div style={{ width: "300px", color: 'black' }}>
          <Select
            // ref={selectRef}
            name="pokemonName"
            onChange={handlePokemonNameChange}
            options={pokemonOptions}
            onMenuScrollToBottom={handlePokemonNameScroll}
            placeholder="Select Pokemon Name"
            isLoading={loading}
          ></Select>
        </div> */}

        {/* version-3 */}
        <PokemonSelectLazyScroll setPokemonName={setPokemonName} setOffset={setOffset} offset={offset} loading={loading} setLoading={setLoading} fetchPokemonList={fetchPokemonList} pokemonList={pokemonList} limit={limit} />

        <select
          name="pokemonAbility"
          value={pokemonAbility}
          onChange={(e) => setPokemonAbility(e.target.value)}
        >
          <option value="">Select Pokémon Ability</option>
          {abilities.map((ability, index) => (
            <option key={index} value={ability}>
              {ability}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="initialPositionX"
          placeholder="Initial Position X"
          value={initialPositionX}
          onChange={(e) => setInitialPositionX(e.target.value)}
        />

        <input
          type="number"
          name="initialPositionY"
          placeholder="Initial Position Y"
          value={initialPositionY}
          onChange={(e) => setInitialPositionY(e.target.value)}
        />

        <input
          type="number"
          name="speed"
          placeholder="Speed (m/s)"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        />

        <select
          name="direction"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="">Select Direction</option>
          <option value="north">North</option>
          <option value="south">South</option>
          <option value="east">East</option>
          <option value="west">West</option>
        </select>
        <button onClick={handleCreatePokemonUser}>Create Pokemon User</button>
      </form>
    </div>
  );
};

export default CreatePokemonUserForm;
