import prisma from './prisma.js';

export async function getClientByTelegramId(telegramId) {
  return prisma.client.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });
}

export async function createClient(data) {
  return prisma.client.create({
    data: {
      telegramId: data.telegramId ? BigInt(data.telegramId) : null,
      telegramUsername: data.telegramUsername,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone
    }
  });
}

export async function updateClient(id, data) {
  return prisma.client.update({
    where: { id },
    data
  });
}

export async function getOrCreateClientByTelegramId(telegramId, username, fullName) {
  let client = await getClientByTelegramId(telegramId);

  if (!client) {
    client = await createClient({
      telegramId,
      telegramUsername: username,
      fullName
    });
  } else if (username && client.telegramUsername !== username) {
    client = await updateClient(client.id, { telegramUsername: username });
  }

  return client;
}
