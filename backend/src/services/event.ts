import { eq } from "drizzle-orm";
import { db } from "../database/index.js";
import { eventLikesTable } from "../database/schema.js";

export async function getAllEvents(userId: string) {
  const events = await db.query.eventsTable.findMany({
    columns: {
      userId: false,
    },
    with: {
      organizer: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    extras: {
      likes: (table) =>
        db.$count(eventLikesTable, eq(table.id, eventLikesTable.eventId)),
    },
  });

  const likedEventIds = await db.query.eventLikesTable.findMany({
    where: { userId: { eq: userId } },
    columns: {
      eventId: true,
    },
  });

  return events.map((event) => {
    const liked = likedEventIds.some((like) => like.eventId === event.id);
    return {
      ...event,
      liked,
    };
  });
}
