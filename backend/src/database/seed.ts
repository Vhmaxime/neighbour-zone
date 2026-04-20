import {
  usersTable,
  postsTable,
  marketplaceItemsTable,
  eventsTable,
  friendshipsTable,
  postLikesTable,
  eventLikesTable,
  marketplaceApplicationsTable,
  eventAttendanceTable,
  conversationsTable,
  messagesTable,
  marketplaceSavesTable,
  communitiesTable,
  communityMembersTable,
} from "./schema";
import { db } from "./index.js";
import { hashPassword } from "../utils/password.js";
import { sql } from "drizzle-orm";

async function seed() {
  // ──────────────────────────────────────────────
  // Clear existing data (respects FK order)
  // ──────────────────────────────────────────────
  await db.delete(messagesTable);
  await db.delete(conversationsTable);
  await db.delete(marketplaceSavesTable);
  await db.delete(marketplaceApplicationsTable);
  await db.delete(eventAttendanceTable);
  await db.delete(eventLikesTable);
  await db.delete(postLikesTable);
  await db.delete(communityMembersTable);
  await db.delete(eventsTable);
  await db.delete(marketplaceItemsTable);
  await db.delete(postsTable);
  await db.delete(friendshipsTable);
  await db.delete(communitiesTable);
  await db.delete(usersTable);

  // ──────────────────────────────────────────────
  // Shared password for all demo accounts: Test1234!
  // ──────────────────────────────────────────────
  const demoPassword = await hashPassword("Test1234!");

  // ════════════════════════════════════════════════
  // 1. USERS (10 users — diverse buurtvolk)
  // ════════════════════════════════════════════════
  const users = await db
    .insert(usersTable)
    .values([
      {
        firstname: "Kobe",
        lastname: "Jansen",
        username: "kobej",
        bio: "Ik hou van fietsen en programmeren. Altijd benieuwd naar nieuwe technologieën.",
        email: "kobe.jansen@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0612345678",
      },
      {
        firstname: "Sanne",
        lastname: "de Vries",
        username: "sannev",
        bio: "Altijd in voor een praatje en een wandeling in het park.",
        email: "sanne.vries@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0687654321",
      },
      {
        firstname: "Ahmed",
        lastname: "El Amrani",
        username: "ahmede",
        bio: "Gek op koken en voetbal. Elke zondag maak ik tajine voor de buren.",
        email: "ahmed.amrani@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0611122233",
      },
      {
        firstname: "Lisa",
        lastname: "Bakker",
        username: "lisab",
        bio: "Community manager en eventorganisator. Ik breng de buurt samen!",
        email: "lisa.bakker@email.com",
        password: demoPassword,
        role: "admin",
        phoneNumber: "0699988776",
      },
      {
        firstname: "Jan",
        lastname: "Smit",
        username: "jans",
        bio: "Gepensioneerd en houdt van tuinieren. Mijn moestuin is mijn trots.",
        email: "jan.smit@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0612349999",
      },
      {
        firstname: "Fatima",
        lastname: "Bouali",
        username: "fatimab",
        bio: "Bakt de lekkerste taarten van Genk. Bestellen kan altijd!",
        email: "fatima.bouali@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0612348888",
      },
      {
        firstname: "Thomas",
        lastname: "Wouters",
        username: "thomasw",
        bio: "Drummer, muziekliefhebber en buurtvrijwilliger.",
        email: "thomas.wouters@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0476123456",
      },
      {
        firstname: "Elena",
        lastname: "Petrova",
        username: "elenap",
        bio: "Yoga-instructrice en natuur-enthousiasteling. Namasté!",
        email: "elena.petrova@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0478654321",
      },
      {
        firstname: "Mohammed",
        lastname: "Yilmaz",
        username: "mohammedy",
        bio: "Handige Harry — klussen, reparaties, noem maar op.",
        email: "mohammed.yilmaz@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0479112233",
      },
      {
        firstname: "Marie",
        lastname: "Claes",
        username: "mariec",
        bio: "Leerkracht en mama van drie. Altijd op zoek naar leuke kinderactiviteiten.",
        email: "marie.claes@email.com",
        password: demoPassword,
        role: "user",
        phoneNumber: "0471998877",
      },
    ])
    .returning({ id: usersTable.id });

  // ════════════════════════════════════════════════
  // 2. COMMUNITIES (3 buurtgemeenschappen)
  // ════════════════════════════════════════════════
  const communities = await db
    .insert(communitiesTable)
    .values([
      {
        name: "Genk Centrum Buren",
        description:
          "De community voor bewoners van Genk Centrum. Deel nieuws, organiseer events en help elkaar!",
        creatorId: users[3].id, // Lisa (admin)
      },
      {
        name: "Groene Vingers Genk",
        description:
          "Voor iedereen met een passie voor tuinieren, moestuinen en stadslandbouw in Genk.",
        creatorId: users[4].id, // Jan
      },
      {
        name: "Sportbuurt Genk",
        description:
          "Samen sporten in de buurt! Van voetbal tot yoga, iedereen is welkom.",
        creatorId: users[2].id, // Ahmed
      },
    ])
    .returning({ id: communitiesTable.id });

  // Community members (creators worden automatisch admin)
  await db.insert(communityMembersTable).values([
    // Genk Centrum Buren — Lisa is creator/admin
    { communityId: communities[0].id, userId: users[3].id, role: "admin" },
    { communityId: communities[0].id, userId: users[0].id, role: "member" },
    { communityId: communities[0].id, userId: users[1].id, role: "member" },
    { communityId: communities[0].id, userId: users[2].id, role: "member" },
    { communityId: communities[0].id, userId: users[6].id, role: "member" },
    { communityId: communities[0].id, userId: users[9].id, role: "member" },
    // Groene Vingers — Jan is creator/admin
    { communityId: communities[1].id, userId: users[4].id, role: "admin" },
    { communityId: communities[1].id, userId: users[0].id, role: "member" },
    { communityId: communities[1].id, userId: users[5].id, role: "member" },
    { communityId: communities[1].id, userId: users[7].id, role: "member" },
    { communityId: communities[1].id, userId: users[9].id, role: "member" },
    // Sportbuurt — Ahmed is creator/admin
    { communityId: communities[2].id, userId: users[2].id, role: "admin" },
    { communityId: communities[2].id, userId: users[0].id, role: "member" },
    { communityId: communities[2].id, userId: users[6].id, role: "member" },
    { communityId: communities[2].id, userId: users[7].id, role: "member" },
    { communityId: communities[2].id, userId: users[8].id, role: "member" },
  ]);

  // ════════════════════════════════════════════════
  // 3. POSTS — 12 global + 6 community posts
  // ════════════════════════════════════════════════
  const posts = await db
    .insert(postsTable)
    .values([
      // --- Global posts ---
      {
        authorId: users[0].id,
        title: "Buurtfeest dit weekend!",
        content:
          "Kom allemaal naar het jaarlijkse buurtfeest in het park. Er is muziek, eten en drinken voor iedereen. Breng gerust je buren mee!",
      },
      {
        authorId: users[1].id,
        title: "Fiets gevonden bij de Carrefour",
        content:
          "Ik heb een blauwe kinderfiets gevonden bij de ingang van Carrefour Genk. Wie herkent hem? Stuur me een bericht.",
      },
      {
        authorId: users[2].id,
        title: "Wie heeft een ladder te leen?",
        content:
          "Ik moet het plafond op zolder schilderen en heb een ladder van minstens 3 meter nodig. Mag ik er eentje lenen dit weekend?",
      },
      {
        authorId: users[4].id,
        title: "Verse eieren te koop",
        content:
          "Van onze eigen kippen! €2 per doosje van 6. Elke zaterdag vers beschikbaar. Kom langs of stuur een berichtje.",
      },
      {
        authorId: users[5].id,
        title: "Taart bestellen voor je feestje?",
        content:
          "Ik bak op bestelling: verjaardagstaarten, cupcakes, baklava en meer. Stuur me gerust een berichtje voor de mogelijkheden!",
      },
      {
        authorId: users[3].id,
        title: "Nieuw speelplein geopend!",
        content:
          "Het nieuwe speelplein aan de Molenvijver is officieel open. Er zijn schommels, een klimrek en een zandbak. Perfect voor de kleintjes!",
      },
      {
        authorId: users[6].id,
        title: "Muzikanten gezocht voor straatfeest",
        content:
          "We organiseren een straatfeest op 10 mei en zoeken nog muzikanten. Gitaar, drums, zang — alles is welkom! Meld je aan.",
      },
      {
        authorId: users[7].id,
        title: "Gratis yoga in het park",
        content:
          "Elke zondagochtend om 9u geef ik gratis yoga in het Molenvijverpark. Breng je matje mee en sluit aan. Alle niveaus welkom!",
      },
      {
        authorId: users[8].id,
        title: "Hulp nodig met je verhuizing?",
        content:
          "Ik heb een bestelwagen en sterke armen. Als je binnenkort verhuist en hulp nodig hebt, laat het me weten. Kleine vergoeding.",
      },
      {
        authorId: users[9].id,
        title: "Kinderopvang delen?",
        content:
          "Zijn er ouders die interesse hebben om samen kinderopvang te regelen? Bv. om de beurt op woensdagmiddag. Stuur me een bericht!",
      },
      {
        authorId: users[0].id,
        title: "Wifi-problemen in de buurt?",
        content:
          "Heeft iemand anders ook last van slechte wifi de laatste dagen? Misschien kunnen we samen contact opnemen met de provider.",
      },
      {
        authorId: users[2].id,
        title: "Gezamenlijke BBQ op zondag",
        content:
          "Wie heeft zin om zondag een BBQ te doen in de achtertuin? Iedereen brengt iets mee. Geef je op in de comments!",
      },
      // --- Community posts ---
      {
        authorId: users[3].id,
        communityId: communities[0].id,
        title: "Welkom bij Genk Centrum Buren!",
        content:
          "Dit is de plek om alles te delen wat er in ons centrum gebeurt. Nieuwe winkels, evenementen, problemen — alles mag hier!",
      },
      {
        authorId: users[0].id,
        communityId: communities[0].id,
        title: "Straatverlichting kapot in de Hoogstraat",
        content:
          "Al drie dagen branden de straatlantaarns niet meer in de Hoogstraat. Heeft iemand dit al gemeld bij de gemeente?",
      },
      {
        authorId: users[4].id,
        communityId: communities[1].id,
        title: "Zaaikalender april",
        content:
          "Tijd om tomaten, courgettes en paprika's te zaaien! Wie wil zaadjes ruilen? Ik heb nog veel over van vorig jaar.",
      },
      {
        authorId: users[7].id,
        communityId: communities[1].id,
        title: "Composttips voor beginners",
        content:
          "Begin met een eenvoudige compostbak in je tuin. Gooi er groente- en fruitresten in, bladeren en koffiedik. Na 3 maanden heb je zwart goud!",
      },
      {
        authorId: users[2].id,
        communityId: communities[2].id,
        title: "Voetbal elke dinsdag om 19u",
        content:
          "We spelen elke dinsdag op het veldje aan de Evence Coppéelaan. Alle niveaus welkom, gewoon je voetbalschoenen meebrengen!",
      },
      {
        authorId: users[7].id,
        communityId: communities[2].id,
        title: "Yoga voor sporters",
        content:
          "Na het sporten is stretchen belangrijk! Ik geef elke donderdag een korte yoga-sessie van 30 minuten speciaal voor sporters.",
      },
    ])
    .returning({ id: postsTable.id });

  // ════════════════════════════════════════════════
  // 4. MARKETPLACE ITEMS — 10 global + 4 community
  // ════════════════════════════════════════════════
  const items = await db
    .insert(marketplaceItemsTable)
    .values([
      // --- Global items ---
      {
        userId: users[2].id,
        title: "Bank te koop",
        description:
          "Comfortabele 3-zits bank, lichtgrijs. Zeer goede staat. Zelf ophalen.",
        price: 50,
        placeDisplayName: "Genk, Centrum",
        placeId: 101,
        lat: "50.9650",
        lon: "5.5000",
        category: "offered",
      },
      {
        userId: users[1].id,
        title: "Boormachine gezocht",
        description:
          "Wie kan mij een boormachine lenen voor het weekend? Heb een paar gaten te boren.",
        price: null,
        placeDisplayName: "Genk, Winterslag",
        placeId: 102,
        lat: "50.9720",
        lon: "5.4800",
        category: "wanted",
      },
      {
        userId: users[4].id,
        title: "Kinderfietsje te koop",
        description:
          "Rood kinderfietsje, 16 inch. Prima staat, onze dochter is eruit gegroeid.",
        price: 25,
        placeDisplayName: "Genk, Kolderbos",
        placeId: 103,
        lat: "50.9635",
        lon: "5.5200",
        category: "offered",
      },
      {
        userId: users[5].id,
        title: "Bakvormen gezocht",
        description:
          "Voor het bakken van taarten heb ik springvormen en tulbandvormen nodig. Wie heeft er nog liggen?",
        price: null,
        placeDisplayName: "Genk, Zwartberg",
        placeId: 104,
        lat: "51.0000",
        lon: "5.5300",
        category: "wanted",
      },
      {
        userId: users[6].id,
        title: "Drumstel te koop",
        description:
          "Akoestisch drumstel, merk Pearl. Inclusief bekkens en kruk. Moet weg wegens verhuis.",
        price: 350,
        placeDisplayName: "Genk, Centrum",
        placeId: 101,
        lat: "50.9650",
        lon: "5.5000",
        category: "offered",
      },
      {
        userId: users[7].id,
        title: "Yogamatten (set van 5)",
        description:
          "Nauwelijks gebruikte yogamatten, ideaal voor groepslessen of thuisgebruik.",
        price: 40,
        placeDisplayName: "Genk, Termien",
        placeId: 105,
        lat: "50.9580",
        lon: "5.5100",
        category: "offered",
      },
      {
        userId: users[8].id,
        title: "Gereedschapskist compleet",
        description:
          "Volledige gereedschapskist met hamer, schroevendraaiers, tang, sleutels. Alles wat je nodig hebt.",
        price: 35,
        placeDisplayName: "Genk, Boxbergheide",
        placeId: 106,
        lat: "50.9700",
        lon: "5.5150",
        category: "offered",
      },
      {
        userId: users[9].id,
        title: "Kinderwagen gezocht",
        description:
          "Op zoek naar een tweedehands kinderwagen in goede staat. Budget tot €80.",
        price: null,
        placeDisplayName: "Genk, Winterslag",
        placeId: 102,
        lat: "50.9720",
        lon: "5.4800",
        category: "wanted",
      },
      {
        userId: users[0].id,
        title: "Oude monitor 24 inch",
        description:
          "Dell monitor, 24 inch, Full HD. Werkt perfect, heb een upgrade genomen.",
        price: 45,
        placeDisplayName: "Genk, Centrum",
        placeId: 101,
        lat: "50.9650",
        lon: "5.5000",
        category: "offered",
      },
      {
        userId: users[3].id,
        title: "Partytent te leen gezocht",
        description:
          "Wie heeft een partytent die ik mag lenen voor het buurtfeest volgende maand?",
        price: null,
        placeDisplayName: "Genk, Centrum",
        placeId: 101,
        lat: "50.9650",
        lon: "5.5000",
        category: "wanted",
      },
      // --- Community items ---
      {
        userId: users[1].id,
        communityId: communities[0].id,
        title: "Boekenplank gratis af te halen",
        description:
          "Houten boekenplank, 180cm hoog. Staat in het centrum, zelf ophalen.",
        price: 0,
        placeDisplayName: "Genk, Centrum",
        placeId: 101,
        lat: "50.9650",
        lon: "5.5000",
        category: "offered",
      },
      {
        userId: users[4].id,
        communityId: communities[1].id,
        title: "Moestuinbakken (3 stuks)",
        description:
          "Houten moestuinbakken, 120x80cm. Inclusief aarde. Afhalen in Kolderbos.",
        price: 30,
        placeDisplayName: "Genk, Kolderbos",
        placeId: 103,
        lat: "50.9635",
        lon: "5.5200",
        category: "offered",
      },
      {
        userId: users[8].id,
        communityId: communities[2].id,
        title: "Voetbaldoeltjes",
        description:
          "Opvouwbare voetbaldoelen, set van 2. Perfect voor in het park.",
        price: 20,
        placeDisplayName: "Genk, Boxbergheide",
        placeId: 106,
        lat: "50.9700",
        lon: "5.5150",
        category: "offered",
      },
      {
        userId: users[7].id,
        communityId: communities[2].id,
        title: "Badmintonset gezocht",
        description:
          "Wie heeft een badmintonset over? Rackets en shuttle, hoeft niet nieuw te zijn.",
        price: null,
        placeDisplayName: "Genk, Termien",
        placeId: 105,
        lat: "50.9580",
        lon: "5.5100",
        category: "wanted",
      },
    ])
    .returning({ id: marketplaceItemsTable.id });

  // ════════════════════════════════════════════════
  // 5. EVENTS — 8 global + 4 community (mix van verleden en toekomst)
  // ════════════════════════════════════════════════
  const events = await db
    .insert(eventsTable)
    .values([
      // --- Global events (verleden) ---
      {
        userId: users[3].id,
        title: "Schoonmaakactie Molenvijverpark",
        description:
          "Help mee het park schoon te maken! Handschoenen en vuilniszakken worden voorzien.",
        placeDisplayName: "Molenvijverpark, Genk",
        placeId: 201,
        lat: "50.9655",
        lon: "5.4950",
        dateTime: new Date("2026-02-10T10:00:00"),
        endAt: new Date("2026-02-10T13:00:00"),
      },
      {
        userId: users[0].id,
        title: "Spelletjesavond",
        description:
          "Neem je favoriete bordspel mee! Van Catan tot Monopoly, alles is welkom.",
        placeDisplayName: "Buurtcentrum Genk Zuid",
        placeId: 202,
        lat: "50.9500",
        lon: "5.4800",
        dateTime: new Date("2026-02-15T19:00:00"),
        endAt: new Date("2026-02-15T23:00:00"),
      },
      {
        userId: users[5].id,
        title: "Bakworkshop taarten",
        description:
          "Leer de lekkerste taarten bakken! Ingrediënten zijn inbegrepen, neem een schort mee.",
        placeDisplayName: "Buurthuis Zwartberg, Genk",
        placeId: 203,
        lat: "51.0000",
        lon: "5.5300",
        dateTime: new Date("2026-03-01T14:00:00"),
        endAt: new Date("2026-03-01T17:00:00"),
      },
      // --- Global events (toekomst) ---
      {
        userId: users[4].id,
        title: "Tuinmiddag: lenteklaar!",
        description:
          "Samen de buurttuin lenteklaar maken. Breng je eigen handschoenen en schoffel mee.",
        placeDisplayName: "Buurttuin Kolderbos, Genk",
        placeId: 204,
        lat: "50.9635",
        lon: "5.5200",
        dateTime: new Date("2026-04-26T13:00:00"),
        endAt: new Date("2026-04-26T16:00:00"),
      },
      {
        userId: users[6].id,
        title: "Straatfeest met live muziek",
        description:
          "Live bands, foodtrucks en gezelligheid! Het grootste buurtfeest van het jaar.",
        placeDisplayName: "Stadsplein Genk",
        placeId: 205,
        lat: "50.9648",
        lon: "5.4980",
        dateTime: new Date("2026-05-10T15:00:00"),
        endAt: new Date("2026-05-10T23:00:00"),
      },
      {
        userId: users[7].id,
        title: "Yoga & Brunch in het park",
        description:
          "Start de ochtend met yoga en sluit af met een gezonde brunch. Matje meebrengen!",
        placeDisplayName: "Molenvijverpark, Genk",
        placeId: 201,
        lat: "50.9655",
        lon: "5.4950",
        dateTime: new Date("2026-05-03T09:00:00"),
        endAt: new Date("2026-05-03T12:00:00"),
      },
      {
        userId: users[9].id,
        title: "Kinderrommelmarkt",
        description:
          "Kinderen verkopen hun eigen speelgoed, boeken en kleren. Leuk en leerzaam!",
        placeDisplayName: "Schoolplein De Boomgaard, Genk",
        placeId: 206,
        lat: "50.9610",
        lon: "5.5050",
        dateTime: new Date("2026-05-17T10:00:00"),
        endAt: new Date("2026-05-17T14:00:00"),
      },
      {
        userId: users[8].id,
        title: "Klus-workshop voor beginners",
        description:
          "Leer de basics: boren, schroeven, muur ophangen. Gereedschap wordt voorzien.",
        placeDisplayName: "Buurthuis Boxbergheide, Genk",
        placeId: 207,
        lat: "50.9700",
        lon: "5.5150",
        dateTime: new Date("2026-05-24T14:00:00"),
        endAt: new Date("2026-05-24T17:00:00"),
      },
      // --- Community events ---
      {
        userId: users[3].id,
        communityId: communities[0].id,
        title: "Buurtoverleg Centrum",
        description:
          "Maandelijks overleg over veiligheid, netheid en activiteiten in het centrum.",
        placeDisplayName: "Gemeentehuis Genk",
        placeId: 208,
        lat: "50.9645",
        lon: "5.4990",
        dateTime: new Date("2026-04-28T19:00:00"),
        endAt: new Date("2026-04-28T21:00:00"),
      },
      {
        userId: users[4].id,
        communityId: communities[1].id,
        title: "Plantenruil",
        description:
          "Breng stekjes en planten mee die je over hebt en ruil ze met andere tuinliefhebbers!",
        placeDisplayName: "Buurttuin Kolderbos, Genk",
        placeId: 204,
        lat: "50.9635",
        lon: "5.5200",
        dateTime: new Date("2026-05-04T10:00:00"),
        endAt: new Date("2026-05-04T13:00:00"),
      },
      {
        userId: users[2].id,
        communityId: communities[2].id,
        title: "Voetbaltoernooi 5v5",
        description:
          "Schrijf je team in voor het buurt-voetbaltoernooi! Maximaal 8 teams, inschrijving verplicht.",
        placeDisplayName: "Sportpark Genk",
        placeId: 209,
        lat: "50.9680",
        lon: "5.4900",
        dateTime: new Date("2026-05-11T13:00:00"),
        endAt: new Date("2026-05-11T18:00:00"),
      },
      {
        userId: users[7].id,
        communityId: communities[2].id,
        title: "Outdoor bootcamp",
        description:
          "Intensieve training in de buitenlucht. Alle niveaus welkom, bring water en een handdoek!",
        placeDisplayName: "Molenvijverpark, Genk",
        placeId: 201,
        lat: "50.9655",
        lon: "5.4950",
        dateTime: new Date("2026-05-18T08:00:00"),
        endAt: new Date("2026-05-18T09:30:00"),
      },
    ])
    .returning({ id: eventsTable.id });

  // ════════════════════════════════════════════════
  // 6. FRIENDSHIPS — uitgebreid netwerk
  // ════════════════════════════════════════════════
  await db.insert(friendshipsTable).values([
    // Kobe's netwerk
    { userId1: users[0].id, userId2: users[1].id, status: "accepted" },
    { userId1: users[0].id, userId2: users[2].id, status: "accepted" },
    { userId1: users[0].id, userId2: users[3].id, status: "accepted" },
    { userId1: users[0].id, userId2: users[6].id, status: "accepted" },
    { userId1: users[0].id, userId2: users[8].id, status: "pending" },
    // Sanne's extra connecties
    { userId1: users[1].id, userId2: users[3].id, status: "accepted" },
    { userId1: users[1].id, userId2: users[7].id, status: "accepted" },
    // Ahmed's connecties
    { userId1: users[2].id, userId2: users[5].id, status: "pending" },
    { userId1: users[2].id, userId2: users[8].id, status: "accepted" },
    // Jan & Fatima
    { userId1: users[4].id, userId2: users[5].id, status: "accepted" },
    { userId1: users[4].id, userId2: users[9].id, status: "accepted" },
    // Thomas & Elena
    { userId1: users[6].id, userId2: users[7].id, status: "accepted" },
    { userId1: users[6].id, userId2: users[9].id, status: "pending" },
    // Mohammed & Marie
    { userId1: users[8].id, userId2: users[9].id, status: "accepted" },
    // Lisa & Fatima
    { userId1: users[3].id, userId2: users[5].id, status: "accepted" },
  ]);

  // ════════════════════════════════════════════════
  // 7. POST LIKES
  // ════════════════════════════════════════════════
  await db.insert(postLikesTable).values([
    // Buurtfeest post — populair
    { userId: users[1].id, postId: posts[0].id },
    { userId: users[2].id, postId: posts[0].id },
    { userId: users[3].id, postId: posts[0].id },
    { userId: users[6].id, postId: posts[0].id },
    { userId: users[9].id, postId: posts[0].id },
    // Fiets gevonden
    { userId: users[0].id, postId: posts[1].id },
    { userId: users[9].id, postId: posts[1].id },
    // Ladder post
    { userId: users[3].id, postId: posts[2].id },
    { userId: users[8].id, postId: posts[2].id },
    // Eieren post
    { userId: users[5].id, postId: posts[3].id },
    { userId: users[1].id, postId: posts[3].id },
    // Taart post
    { userId: users[0].id, postId: posts[4].id },
    { userId: users[3].id, postId: posts[4].id },
    { userId: users[9].id, postId: posts[4].id },
    // Speelplein post
    { userId: users[9].id, postId: posts[5].id },
    { userId: users[1].id, postId: posts[5].id },
    { userId: users[0].id, postId: posts[5].id },
    // Muzikanten
    { userId: users[0].id, postId: posts[6].id },
    { userId: users[2].id, postId: posts[6].id },
    // Yoga
    { userId: users[1].id, postId: posts[7].id },
    { userId: users[6].id, postId: posts[7].id },
    { userId: users[9].id, postId: posts[7].id },
    // Verhuizing
    { userId: users[0].id, postId: posts[8].id },
    // BBQ
    { userId: users[1].id, postId: posts[11].id },
    { userId: users[5].id, postId: posts[11].id },
    { userId: users[6].id, postId: posts[11].id },
    { userId: users[7].id, postId: posts[11].id },
  ]);

  // ════════════════════════════════════════════════
  // 8. EVENT LIKES
  // ════════════════════════════════════════════════
  await db.insert(eventLikesTable).values([
    // Schoonmaakactie
    { userId: users[0].id, eventId: events[0].id },
    { userId: users[1].id, eventId: events[0].id },
    { userId: users[4].id, eventId: events[0].id },
    // Spelletjesavond
    { userId: users[2].id, eventId: events[1].id },
    { userId: users[1].id, eventId: events[1].id },
    { userId: users[9].id, eventId: events[1].id },
    // Bakworkshop
    { userId: users[3].id, eventId: events[2].id },
    { userId: users[5].id, eventId: events[2].id },
    { userId: users[9].id, eventId: events[2].id },
    // Tuinmiddag (toekomst)
    { userId: users[0].id, eventId: events[3].id },
    { userId: users[7].id, eventId: events[3].id },
    // Straatfeest — populairste event
    { userId: users[0].id, eventId: events[4].id },
    { userId: users[1].id, eventId: events[4].id },
    { userId: users[2].id, eventId: events[4].id },
    { userId: users[3].id, eventId: events[4].id },
    { userId: users[5].id, eventId: events[4].id },
    { userId: users[8].id, eventId: events[4].id },
    { userId: users[9].id, eventId: events[4].id },
    // Yoga & Brunch
    { userId: users[1].id, eventId: events[5].id },
    { userId: users[6].id, eventId: events[5].id },
    // Kinderrommelmarkt
    { userId: users[3].id, eventId: events[6].id },
    { userId: users[5].id, eventId: events[6].id },
    { userId: users[9].id, eventId: events[6].id },
    // Klus-workshop
    { userId: users[0].id, eventId: events[7].id },
    { userId: users[2].id, eventId: events[7].id },
  ]);

  // ════════════════════════════════════════════════
  // 9. EVENT ATTENDANCE
  // ════════════════════════════════════════════════
  await db.insert(eventAttendanceTable).values([
    // Schoonmaakactie
    { userId: users[0].id, eventId: events[0].id },
    { userId: users[1].id, eventId: events[0].id },
    { userId: users[2].id, eventId: events[0].id },
    { userId: users[4].id, eventId: events[0].id },
    // Spelletjesavond
    { userId: users[1].id, eventId: events[1].id },
    { userId: users[2].id, eventId: events[1].id },
    { userId: users[3].id, eventId: events[1].id },
    { userId: users[9].id, eventId: events[1].id },
    // Bakworkshop
    { userId: users[3].id, eventId: events[2].id },
    { userId: users[5].id, eventId: events[2].id },
    { userId: users[9].id, eventId: events[2].id },
    // Tuinmiddag
    { userId: users[0].id, eventId: events[3].id },
    { userId: users[4].id, eventId: events[3].id },
    { userId: users[7].id, eventId: events[3].id },
    // Straatfeest
    { userId: users[0].id, eventId: events[4].id },
    { userId: users[1].id, eventId: events[4].id },
    { userId: users[2].id, eventId: events[4].id },
    { userId: users[3].id, eventId: events[4].id },
    { userId: users[5].id, eventId: events[4].id },
    { userId: users[8].id, eventId: events[4].id },
    // Yoga & Brunch
    { userId: users[1].id, eventId: events[5].id },
    { userId: users[6].id, eventId: events[5].id },
    { userId: users[9].id, eventId: events[5].id },
    // Kinderrommelmarkt
    { userId: users[3].id, eventId: events[6].id },
    { userId: users[9].id, eventId: events[6].id },
    // Klus-workshop
    { userId: users[0].id, eventId: events[7].id },
    { userId: users[2].id, eventId: events[7].id },
    { userId: users[6].id, eventId: events[7].id },
  ]);

  // ════════════════════════════════════════════════
  // 10. MARKETPLACE APPLICATIONS
  // ════════════════════════════════════════════════
  await db.insert(marketplaceApplicationsTable).values([
    // Bank
    {
      userId: users[0].id,
      marketplaceItemId: items[0].id,
      message: "Is de bank nog beschikbaar? Ik kan hem vandaag ophalen.",
    },
    {
      userId: users[9].id,
      marketplaceItemId: items[0].id,
      message: "Wat zijn de afmetingen precies?",
    },
    // Boormachine
    {
      userId: users[8].id,
      marketplaceItemId: items[1].id,
      message: "Ik heb een Bosch boormachine die je mag lenen!",
    },
    {
      userId: users[0].id,
      marketplaceItemId: items[1].id,
      message: "Ik heb er ook eentje, laat maar weten.",
    },
    // Kinderfietsje
    {
      userId: users[9].id,
      marketplaceItemId: items[2].id,
      message: "Perfect voor onze dochter! Is het nog beschikbaar?",
    },
    // Bakvormen
    {
      userId: users[3].id,
      marketplaceItemId: items[3].id,
      message: "Ik heb nog een springvorm en een tulbandvorm voor je.",
    },
    // Drumstel
    {
      userId: users[2].id,
      marketplaceItemId: items[4].id,
      message: "Mag ik het eerst uitproberen?",
    },
    // Monitor
    {
      userId: users[6].id,
      marketplaceItemId: items[8].id,
      message: "Wat voor aansluiting heeft de monitor? HDMI?",
    },
    // Partytent
    {
      userId: users[0].id,
      marketplaceItemId: items[9].id,
      message: "Ik heb een partytent van 3x6m, mag je gerust lenen!",
    },
  ]);

  // ════════════════════════════════════════════════
  // 11. MARKETPLACE SAVES
  // ════════════════════════════════════════════════
  await db.insert(marketplaceSavesTable).values([
    { userId: users[0].id, marketplaceItemId: items[0].id },
    { userId: users[0].id, marketplaceItemId: items[4].id },
    { userId: users[1].id, marketplaceItemId: items[5].id },
    { userId: users[3].id, marketplaceItemId: items[2].id },
    { userId: users[5].id, marketplaceItemId: items[6].id },
    { userId: users[7].id, marketplaceItemId: items[4].id },
    { userId: users[9].id, marketplaceItemId: items[2].id },
    { userId: users[9].id, marketplaceItemId: items[7].id },
    { userId: users[6].id, marketplaceItemId: items[8].id },
  ]);

  // ════════════════════════════════════════════════
  // 12. CONVERSATIONS & MESSAGES
  // ════════════════════════════════════════════════
  const conversations = await db
    .insert(conversationsTable)
    .values([
      { participant1Id: users[0].id, participant2Id: users[1].id },
      { participant1Id: users[0].id, participant2Id: users[2].id },
      { participant1Id: users[0].id, participant2Id: users[8].id },
      { participant1Id: users[4].id, participant2Id: users[5].id },
      { participant1Id: users[3].id, participant2Id: users[9].id },
      { participant1Id: users[6].id, participant2Id: users[7].id },
    ])
    .returning({ id: conversationsTable.id });

  await db.insert(messagesTable).values([
    // Kobe <-> Sanne
    {
      senderId: users[0].id,
      conversationId: conversations[0].id,
      content: "Hey Sanne! Ga je ook naar het buurtfeest dit weekend?",
      readAt: new Date("2026-04-18T10:05:00"),
    },
    {
      senderId: users[1].id,
      conversationId: conversations[0].id,
      content: "Zeker! Ik neem een salade mee. Jij?",
      readAt: new Date("2026-04-18T10:10:00"),
    },
    {
      senderId: users[0].id,
      conversationId: conversations[0].id,
      content: "Ik regel de drank 🍻 Tot dan!",
      readAt: new Date("2026-04-18T10:12:00"),
    },
    // Kobe <-> Ahmed
    {
      senderId: users[2].id,
      conversationId: conversations[1].id,
      content: "Kobe, heb je zin om dinsdag te voetballen?",
      readAt: new Date("2026-04-19T14:00:00"),
    },
    {
      senderId: users[0].id,
      conversationId: conversations[1].id,
      content: "Ja man, ik ben erbij! Hoe laat?",
      readAt: new Date("2026-04-19T14:05:00"),
    },
    {
      senderId: users[2].id,
      conversationId: conversations[1].id,
      content: "19u aan het veldje, neem je schoenen mee.",
    },
    // Kobe <-> Mohammed
    {
      senderId: users[0].id,
      conversationId: conversations[2].id,
      content:
        "Hey Mohammed, ik heb een probleem met mijn deur. Kan jij eens kijken?",
    },
    {
      senderId: users[8].id,
      conversationId: conversations[2].id,
      content: "Tuurlijk! Wat is het probleem precies?",
    },
    {
      senderId: users[0].id,
      conversationId: conversations[2].id,
      content: "De scharnieren zijn los, de deur sluit niet meer goed.",
    },
    {
      senderId: users[8].id,
      conversationId: conversations[2].id,
      content:
        "Ah dat is makkelijk, ik kom morgen even langs met mijn gereedschap!",
    },
    // Jan <-> Fatima
    {
      senderId: users[4].id,
      conversationId: conversations[3].id,
      content: "Fatima, heb je nog courgettes nodig? Ik heb er veel te veel 😄",
      readAt: new Date("2026-04-17T09:00:00"),
    },
    {
      senderId: users[5].id,
      conversationId: conversations[3].id,
      content:
        "Oh ja graag! Ik maak er curgette-brood van. Ik breng je een stuk!",
      readAt: new Date("2026-04-17T09:15:00"),
    },
    // Lisa <-> Marie
    {
      senderId: users[3].id,
      conversationId: conversations[4].id,
      content:
        "Marie, wil je helpen met de organisatie van de kinderrommelmarkt?",
      readAt: new Date("2026-04-19T16:00:00"),
    },
    {
      senderId: users[9].id,
      conversationId: conversations[4].id,
      content: "Ja super leuk! Wat moet er allemaal geregeld worden?",
      readAt: new Date("2026-04-19T16:10:00"),
    },
    {
      senderId: users[3].id,
      conversationId: conversations[4].id,
      content:
        "Vooral kraampjes indelen en flyers verspreiden. Ik maak een lijstje.",
    },
    // Thomas <-> Elena
    {
      senderId: users[6].id,
      conversationId: conversations[5].id,
      content: "Elena, zou je een keer live muziek willen bij je yoga-sessie?",
      readAt: new Date("2026-04-18T20:00:00"),
    },
    {
      senderId: users[7].id,
      conversationId: conversations[5].id,
      content: "Dat zou geweldig zijn! Drums bij yoga klinkt heel bijzonder 🎵",
      readAt: new Date("2026-04-18T20:30:00"),
    },
    {
      senderId: users[6].id,
      conversationId: conversations[5].id,
      content: "Ik kan ook handpan spelen, dat past misschien beter 😄",
    },
  ]);

  console.log("Database seeded successfully!");
  console.log(`  → ${users.length} users`);
  console.log(`  → ${communities.length} communities`);
  console.log(`  → ${posts.length} posts`);
  console.log(`  → ${items.length} marketplace items`);
  console.log(`  → ${events.length} events`);
  console.log(`  → ${conversations.length} conversations`);
  console.log(
    "  → friendships, likes, attendance, applications, saves & messages included",
  );
  await db.$client.end();
}

seed();
