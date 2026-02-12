// Inside your onActivityUpdate trigger
const newCosmetic = await generateCompleteCosmetic(cosmeticData);

await db.collection('users').doc(userId).update({
  [`aiGeneratedCosmetics.${newCosmetic.id}`]: newCosmetic,
  [`avatarLayers.${newCosmetic.id}`]: true, // AUTO-EQUIP on earn
  newCosmeticsCount: admin.firestore.FieldValue.increment(1)
});
