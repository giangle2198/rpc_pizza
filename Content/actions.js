window.Actions = {
  damage1: {
    name: "Damage 1",
    success: [
      { type: "message", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
  saucyStatus: {
    name: "Tomato Squeezy!",
    targetType: "friendly",
    success: [
      { type: "message", text: "{CASTER} uses {ACTION}!" },
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } },
    ],
  },
  clumsyStatus: {
    name: "Olive Oil!",
    success: [
      { type: "message", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "message", text: "{TARGET} is slipping all around!" },
    ],
  },
  //Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    success: [
      { type: "message", text: "{CASTER} uses a {ACTION}!" },
      { type: "stateChange", status: null },
      { type: "message", text: "Feeling fresh!" },
    ],
  },
  item_recoverHp: {
    name: "Parmesan",
    targetType: "friendly",
    success: [
      { type: "message", text: "{CASTER} sprinkles on some {ACTION}!" },
      { type: "stateChange", recover: 10 },
      { type: "message", text: "{CASTER} recovers HP!" },
    ],
  },
};
