import { v4 as uuidv4 } from "uuid";
import {
  Share,
  Team,
  User,
  Event,
  Document,
  Star,
  Collection,
  Group,
  GroupUser,
  Attachment,
  IntegrationAuthentication,
  Integration,
  AuthenticationProvider,
  FileOperation,
} from "@server/models";

let count = 1;

export async function buildShare(overrides: Partial<Share> = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  if (!overrides.documentId) {
    const document = await buildDocument({
      createdById: overrides.userId,
      teamId: overrides.teamId,
    });
    overrides.documentId = document.id;
  }

  return Share.create({
    published: true,
    ...overrides,
  });
}

export async function buildStar(overrides: Partial<Star> = {}) {
  let user;

  if (overrides.userId) {
    user = await User.findByPk(overrides.userId);
  } else {
    user = await buildUser();
    overrides.userId = user.id;
  }

  if (!overrides.documentId) {
    const document = await buildDocument({
      createdById: overrides.userId,
      teamId: user?.teamId,
    });
    overrides.documentId = document.id;
  }

  return Star.create({
    index: "h",
    ...overrides,
  });
}

export function buildTeam(overrides: Record<string, any> = {}) {
  count++;
  return Team.create(
    {
      name: `Team ${count}`,
      collaborativeEditing: false,
      authenticationProviders: [
        {
          name: "slack",
          providerId: uuidv4(),
        },
      ],
      ...overrides,
    },
    {
      include: "authenticationProviders",
    }
  );
}

export function buildEvent(overrides: Partial<Event> = {}) {
  return Event.create({
    name: "documents.publish",
    ip: "127.0.0.1",
    ...overrides,
  });
}

export async function buildGuestUser(overrides: Partial<User> = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  count++;
  return User.create({
    email: `user${count}@example.com`,
    name: `User ${count}`,
    createdAt: new Date("2018-01-01T00:00:00.000Z"),
    lastActiveAt: new Date("2018-01-01T00:00:00.000Z"),
    ...overrides,
  });
}

export async function buildUser(overrides: Partial<User> = {}) {
  let team;

  if (!overrides.teamId) {
    team = await buildTeam();
    overrides.teamId = team.id;
  } else {
    team = await Team.findByPk(overrides.teamId);
  }

  const authenticationProvider = await AuthenticationProvider.findOne({
    where: {
      teamId: overrides.teamId,
    },
  });
  count++;
  return User.create(
    {
      email: `user${count}@example.com`,
      name: `User ${count}`,
      username: `user${count}`,
      createdAt: new Date("2018-01-01T00:00:00.000Z"),
      lastActiveAt: new Date("2018-01-01T00:00:00.000Z"),
      authentications: [
        {
          authenticationProviderId: authenticationProvider!.id,
          providerId: uuidv4(),
        },
      ],
      ...overrides,
    },
    {
      include: "authentications",
    }
  );
}

export async function buildAdmin(overrides: Partial<User> = {}) {
  return buildUser({ ...overrides, isAdmin: true });
}

export async function buildInvite(overrides: Partial<User> = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  count++;
  return User.create({
    email: `user${count}@example.com`,
    name: `User ${count}`,
    createdAt: new Date("2018-01-01T00:00:00.000Z"),
    ...overrides,
  });
}

export async function buildIntegration(overrides: Partial<Integration> = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  const user = await buildUser({
    teamId: overrides.teamId,
  });
  const authentication = await IntegrationAuthentication.create({
    service: "slack",
    userId: user.id,
    teamId: user.teamId,
    token: "fake-access-token",
    scopes: ["example", "scopes", "here"],
  });
  return Integration.create({
    type: "post",
    service: "slack",
    settings: {
      serviceTeamId: "slack_team_id",
    },
    authenticationId: authentication.id,
    ...overrides,
  });
}

export async function buildCollection(
  overrides: Partial<Collection> & { userId?: string } = {}
) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  count++;
  return Collection.create({
    name: `Test Collection ${count}`,
    description: "Test collection description",
    createdById: overrides.userId,
    permission: "read_write",
    ...overrides,
  });
}

export async function buildGroup(
  overrides: Partial<Group> & { userId?: string } = {}
) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  count++;
  return Group.create({
    name: `Test Group ${count}`,
    createdById: overrides.userId,
    ...overrides,
  });
}

export async function buildGroupUser(
  overrides: Partial<GroupUser> & { userId?: string; teamId?: string } = {}
) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  count++;
  return GroupUser.create({
    createdById: overrides.userId,
    ...overrides,
  });
}

export async function buildDocument(
  overrides: Partial<Document> & { userId?: string } = {}
) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }

  if (!overrides.collectionId) {
    const collection = await buildCollection({
      teamId: overrides.teamId,
      userId: overrides.userId,
    });
    overrides.collectionId = collection.id;
  }

  count++;
  return Document.create({
    title: `Document ${count}`,
    text: "This is the text in an example document",
    publishedAt: new Date(),
    lastModifiedById: overrides.userId,
    createdById: overrides.userId,
    ...overrides,
  });
}

export async function buildFileOperation(
  overrides: Partial<FileOperation> = {}
) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildAdmin({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  return FileOperation.create({
    state: "creating",
    size: 0,
    key: "uploads/key/to/file.zip",
    collectionId: null,
    type: "export",
    url: "https://www.urltos3file.com/file.zip",
    ...overrides,
  });
}

export async function buildAttachment(overrides: Partial<Attachment> = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId,
    });
    overrides.userId = user.id;
  }

  if (!overrides.documentId) {
    const document = await buildDocument({
      teamId: overrides.teamId,
      userId: overrides.userId,
    });
    overrides.documentId = document.id;
  }

  count++;
  return Attachment.create({
    key: `uploads/key/to/file ${count}.png`,
    url: `https://redirect.url.com/uploads/key/to/file ${count}.png`,
    contentType: "image/png",
    size: 100,
    acl: "public-read",
    createdAt: new Date("2018-01-02T00:00:00.000Z"),
    updatedAt: new Date("2018-01-02T00:00:00.000Z"),
    ...overrides,
  });
}
