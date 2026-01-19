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
} from "./schema";
import { db } from "./index.js";

async function seed() {
  const users = await db
    .insert(usersTable)
    .values([
      {
        firstname: "Kobe",
        lastname: "Jansen",
        username: "kobej",
        bio: "Ik hou van fietsen en programmeren.",
        email: "kobe.jansen@email.com",
        password: "hashedpassword1",
        role: "user",
        phoneNumber: "0612345678",
      },
      {
        firstname: "Sanne",
        lastname: "de Vries",
        username: "sannev",
        bio: "Altijd in voor een praatje.",
        email: "sanne.vries@email.com",
        password: "hashedpassword2",
        role: "user",
        phoneNumber: "0687654321",
      },
      {
        firstname: "Ahmed",
        lastname: "El Amrani",
        username: "ahmede",
        bio: "Gek op koken en voetbal.",
        email: "ahmed.amrani@email.com",
        password: "hashedpassword3",
        role: "user",
        phoneNumber: "0611122233",
      },
      {
        firstname: "Lisa",
        lastname: "Bakker",
        username: "lisab",
        bio: "Ik organiseer graag evenementen.",
        email: "lisa.bakker@email.com",
        password: "hashedpassword4",
        role: "admin",
        phoneNumber: "0699988776",
      },
      {
        firstname: "Jan",
        lastname: "Smit",
        username: "jans",
        bio: "Houdt van tuinieren.",
        email: "jan.smit@email.com",
        password: "hashedpassword5",
        role: "user",
        phoneNumber: "0612349999",
      },
      {
        firstname: "Fatima",
        lastname: "Bouali",
        username: "fatimab",
        bio: "Bakt de lekkerste taarten.",
        email: "fatima.bouali@email.com",
        password: "hashedpassword6",
        role: "user",
        phoneNumber: "0612348888",
      },
    ])
    .returning({ id: usersTable.id });

  // Posts
  const posts = await db
    .insert(postsTable)
    .values([
      {
        authorId: users[0].id,
        title: "Buurtfeest dit weekend!",
        content: "Kom allemaal naar het jaarlijkse buurtfeest in het park.",
      },
      {
        authorId: users[1].id,
        title: "Fiets gevonden",
        content: "Ik heb een blauwe fiets gevonden bij de supermarkt.",
      },
      {
        authorId: users[2].id,
        title: "Wie heeft een ladder te leen?",
        content: "Ik moet iets schilderen op zolder.",
      },
      {
        authorId: users[4].id,
        title: "Verse eieren te koop",
        content: "Van eigen kippen, €2 per doosje.",
      },
      {
        authorId: users[5].id,
        title: "Taart bestellen?",
        content: "Ik bak op bestelling, stuur gerust een berichtje!",
      },
    ])
    .returning({ id: postsTable.id });

  // Marketplace items
  const items = await db
    .insert(marketplaceItemsTable)
    .values([
      {
        userId: users[2].id,
        title: "Bank te koop",
        description: "Comfortabele 3-zits bank, lichtgrijs.",
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
        description: "Wie kan mij een boormachine lenen voor het weekend?",
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
        description: "Rood kinderfietsje, 16 inch, €25.",
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
          "Voor het bakken van taarten, wie heeft er nog wat liggen?",
        price: null,
        placeDisplayName: "Genk, Zwartberg",
        placeId: 104,
        lat: "51.0000",
        lon: "5.5300",
        category: "wanted",
      },
    ])
    .returning({ id: marketplaceItemsTable.id });

  // Events
  const events = await db
    .insert(eventsTable)
    .values([
      {
        userId: users[3].id,
        title: "Schoonmaakactie Molenvijverpark",
        description: "Help mee het park schoon te maken!",
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
        description: "Neem je favoriete bordspel mee.",
        placeDisplayName: "Buurtcentrum Genk Zuid",
        placeId: 202,
        lat: "50.9500",
        lon: "5.4800",
        dateTime: new Date("2026-02-15T19:00:00"),
        endAt: new Date("2026-02-15T23:00:00"),
      },
      {
        userId: users[5].id,
        title: "Bakworkshop",
        description: "Leer de lekkerste taarten bakken!",
        placeDisplayName: "Buurthuis Zwartberg, Genk",
        placeId: 203,
        lat: "51.0000",
        lon: "5.5300",
        dateTime: new Date("2026-03-01T14:00:00"),
        endAt: new Date("2026-03-01T17:00:00"),
      },
      {
        userId: users[4].id,
        title: "Tuinmiddag",
        description: "Samen de buurttuin zomerklaar maken.",
        placeDisplayName: "Buurttuin Kolderbos, Genk",
        placeId: 204,
        lat: "50.9635",
        lon: "5.5200",
        dateTime: new Date("2026-03-10T13:00:00"),
        endAt: new Date("2026-03-10T16:00:00"),
      },
    ])
    .returning({ id: eventsTable.id });

  // Vriendschappen
  await db.insert(friendshipsTable).values([
    {
      userId1: users[0].id,
      userId2: users[1].id,
      status: "accepted",
    },
    {
      userId1: users[0].id,
      userId2: users[2].id,
      status: "pending",
    },
    {
      userId1: users[1].id,
      userId2: users[3].id,
      status: "accepted",
    },
    {
      userId1: users[4].id,
      userId2: users[5].id,
      status: "accepted",
    },
    {
      userId1: users[2].id,
      userId2: users[5].id,
      status: "pending",
    },
  ]);

  // Likes op posts
  await db.insert(postLikesTable).values([
    {
      userId: users[1].id,
      postId: posts[0].id,
    },
    {
      userId: users[2].id,
      postId: posts[0].id,
    },
    {
      userId: users[0].id,
      postId: posts[1].id,
    },
    {
      userId: users[3].id,
      postId: posts[2].id,
    },
    {
      userId: users[4].id,
      postId: posts[3].id,
    },
    {
      userId: users[5].id,
      postId: posts[4].id,
    },
    {
      userId: users[0].id,
      postId: posts[4].id,
    },
  ]);

  // Likes op events
  await db.insert(eventLikesTable).values([
    {
      userId: users[0].id,
      eventId: events[0].id,
    },
    {
      userId: users[1].id,
      eventId: events[0].id,
    },
    {
      userId: users[2].id,
      eventId: events[1].id,
    },
    {
      userId: users[3].id,
      eventId: events[2].id,
    },
    {
      userId: users[4].id,
      eventId: events[3].id,
    },
    {
      userId: users[5].id,
      eventId: events[2].id,
    },
  ]);

  // Marketplace applications
  await db.insert(marketplaceApplicationsTable).values([
    {
      userId: users[0].id,
      marketplaceItemId: items[0].id,
      message: "Is de bank nog beschikbaar?",
    },
    {
      userId: users[3].id,
      marketplaceItemId: items[1].id,
      message: "Ik heb een boormachine die je mag lenen.",
    },
    {
      userId: users[1].id,
      marketplaceItemId: items[2].id,
      message: "Is het fietsje nog te koop?",
    },
    {
      userId: users[2].id,
      marketplaceItemId: items[3].id,
      message: "Ik heb nog een bakvorm voor je.",
    },
  ]);

  // Event attendance
  await db.insert(eventAttendanceTable).values([
    {
      userId: users[1].id,
      eventId: events[0].id,
    },
    {
      userId: users[2].id,
      eventId: events[0].id,
    },
    {
      userId: users[0].id,
      eventId: events[1].id,
    },
    {
      userId: users[3].id,
      eventId: events[2].id,
    },
    {
      userId: users[4].id,
      eventId: events[3].id,
    },
    {
      userId: users[5].id,
      eventId: events[2].id,
    },
  ]);

  console.log("Database seeded successfully.");
  await db.$client.end();
}

seed();
