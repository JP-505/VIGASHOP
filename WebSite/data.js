
const GAMES = [
  {
    id: "g01", title: "Neon Ronin", genre: "Acción", icon: "🗡️",
    platforms: ["PC", "PS5", "Xbox Series X"], price: 59.99, discount: 20, isNew: true,
    rating: 4.7, releaseDate: "2026-08-04",
    description: "Un samurái cibernético recorre una metrópolis lluviosa desmantelando corporaciones con katana y hackeo en tiempo real. Combate veloz, historia ramificada."
  },
  {
    id: "g02", title: "Ashen Vale", genre: "RPG", icon: "🌌",
    platforms: ["PC", "PS5", "Switch"], price: 49.99, discount: 0, isNew: true,
    rating: 4.9, releaseDate: "2026-08-07",
    description: "RPG de mundo abierto ambientado en un reino cubierto de ceniza volcánica. Construye tu clase desde cero y toma decisiones que reescriben el mapa."
  },
  {
    id: "g03", title: "Rift Runners", genre: "Carreras", icon: "🏎️",
    platforms: ["PC", "Xbox Series X", "Switch"], price: 39.99, discount: 15, isNew: false,
    rating: 4.3, releaseDate: "2026-05-12",
    description: "Carreras callejeras a través de portales dimensionales. Cada circuito cambia sus leyes de física a mitad de vuelta."
  },
  {
    id: "g04", title: "Hollow Choir", genre: "Terror", icon: "👻",
    platforms: ["PC", "PS5"], price: 29.99, discount: 30, isNew: false,
    rating: 4.5, releaseDate: "2026-03-20",
    description: "Un internado abandonado, un coro que nadie canta y tú, buscando a tu hermana. Terror psicológico con sonido binaural."
  },
  {
    id: "g05", title: "Kingdoms of Iyra", genre: "Estrategia", icon: "♟️",
    platforms: ["PC"], price: 44.99, discount: 0, isNew: false,
    rating: 4.6, releaseDate: "2026-01-15",
    description: "Estrategia por turnos 4X con diplomacia profunda entre seis facciones. Cada partida dura lo que tú decidas."
  },
  {
    id: "g06", title: "Skybound Strikers", genre: "Deportes", icon: "⚽",
    platforms: ["PS5", "Xbox Series X", "Switch"], price: 34.99, discount: 10, isNew: false,
    rating: 4.1, releaseDate: "2025-11-02",
    description: "Fútbol arcade en plataformas flotantes con física exagerada y torneos online semanales."
  },
  {
    id: "g07", title: "Pixel Pilgrim", genre: "Indie", icon: "🚶",
    platforms: ["PC", "Switch"], price: 14.99, discount: 0, isNew: true,
    rating: 4.8, releaseDate: "2026-08-01",
    description: "Un plataformas contemplativo sobre un peregrino que cruza cuatro estaciones en busca de su hogar perdido."
  },
  {
    id: "g08", title: "Crimson Tide Tactics", genre: "Estrategia", icon: "⚔️",
    platforms: ["PC", "PS5"], price: 54.99, discount: 25, isNew: false,
    rating: 4.4, releaseDate: "2025-09-18",
    description: "Tácticas navales y terrestres en una guerra civil ficticia. Cada batalla se resuelve en un tablero hexagonal dinámico."
  },
  {
    id: "g09", title: "Wraith Protocol", genre: "Acción", icon: "🎯",
    platforms: ["PC", "Xbox Series X"], price: 59.99, discount: 0, isNew: true,
    rating: 4.6, releaseDate: "2026-08-09",
    description: "Shooter táctico de infiltración con IA adaptativa: los enemigos aprenden tus patrones partida tras partida."
  },
  {
    id: "g10", title: "Emberfall Saga", genre: "RPG", icon: "🔥",
    platforms: ["PC", "PS5", "Xbox Series X", "Switch"], price: 64.99, discount: 10, isNew: false,
    rating: 4.9, releaseDate: "2025-12-05",
    description: "Trilogía épica reunida en un solo pack: tres generaciones de una misma familia salvando (o condenando) su reino."
  },
  {
    id: "g11", title: "Static Circuit", genre: "Carreras", icon: "🏁",
    platforms: ["PC", "PS5"], price: 49.99, discount: 0, isNew: false,
    rating: 4.2, releaseDate: "2025-10-22",
    description: "Simulador de motos eléctricas con circuitos urbanos reales y un editor de pistas comunitario."
  },
  {
    id: "g12", title: "Mothlight", genre: "Indie", icon: "🦋",
    platforms: ["Switch", "PC"], price: 9.99, discount: 40, isNew: false,
    rating: 4.7, releaseDate: "2025-07-30",
    description: "Puzles de luz y sombra guiando a una polilla a través de un bosque que se pliega sobre sí mismo."
  },
  {
    id: "g13", title: "Voidkeeper", genre: "Terror", icon: "🕯️",
    platforms: ["PC", "PS5", "Xbox Series X"], price: 39.99, discount: 0, isNew: true,
    rating: 4.4, releaseDate: "2026-07-28",
    description: "Sobrevive como guardián nocturno de un faro donde la marea trae algo más que agua cada medianoche."
  },
  {
    id: "g14", title: "Sundial Legacy", genre: "Aventura", icon: "🗺️",
    platforms: ["PC", "Switch"], price: 44.99, discount: 15, isNew: false,
    rating: 4.5, releaseDate: "2025-06-14",
    description: "Explora ruinas que cambian según la hora real de tu reloj. Cada visita revela secretos distintos."
  },
  {
    id: "g15", title: "Thunder Pitch", genre: "Deportes", icon: "🏈",
    platforms: ["PC", "PS5", "Xbox Series X"], price: 59.99, discount: 20, isNew: false,
    rating: 4.0, releaseDate: "2025-08-30",
    description: "Fútbol americano de temporada completa con gestión de equipo y clima dinámico que altera cada jugada."
  },
  {
    id: "g16", title: "Glassforge", genre: "Aventura", icon: "🏔️",
    platforms: ["PC", "PS5"], price: 34.99, discount: 0, isNew: false,
    rating: 4.6, releaseDate: "2025-04-09",
    description: "Escala una cordillera de vidrio volcánico junto a una compañera robótica que traduce el idioma de la montaña."
  }
];
