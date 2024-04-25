let wpRequire;

window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  (req) => {
    wpRequire = req;
  },
]);

let api = Object.values(wpRequire.c).find((x) => x?.exports?.getAPIBaseURL)
  .exports.HTTP;
let ApplicationStreamingStore = Object.values(wpRequire.c).find(
  (x) => x?.exports?.default?.getStreamerActiveStreamMetadata
).exports.default;
let QuestsStore = Object.values(wpRequire.c).find(
  (x) => x?.exports?.default?.getQuest
).exports.default;
let encodeStreamKey = Object.values(wpRequire.c).find(
  (x) => x?.exports?.encodeStreamKey
).exports.encodeStreamKey;
let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Encontra uma missão incompleta
// Find an incomplete quest
let quest = [...QuestsStore.quests.values()].find(
  (x) => x.userStatus?.enrolledAt && !x.userStatus?.completedAt
);

if (!quest) {
  console.log("[PT-BR] Você não tem nenhuma missão incompleta!");
  console.log("[EN-US] You don't have any incomplete quests!");
} else {
  let streamId = encodeStreamKey(
    ApplicationStreamingStore.getCurrentUserActiveStream()
  );
  let secondsNeeded = quest.config.streamDurationRequirementMinutes * 60;

  // Defina uma função para enviar periodicamente solicitações para concluir a missão
  // Define a function to periodically send requests to complete the quest
  let heartbeat = async function () {
    console.log(
      "[PT-BR] Iniciando missão",
      quest.config.messages.gameTitle,
      "-",
      quest.config.messages.questName
    );
    console.log(
      "[EN-US] Starting quest:",
      quest.config.messages.gameTitle,
      "-",
      quest.config.messages.questName
    );
    while (true) {
      let res = await api.post({
        url: `/quests/${quest.id}/heartbeat`,
        body: { stream_key: streamId },
      });
      let progress = res.body.stream_progress_seconds;

      console.log(`[PT-BR] Progresso da missão: ${progress}/${secondsNeeded}`);
      console.log(`[EN-US] Quest progress: ${progress}/${secondsNeeded}`);

      if (progress >= secondsNeeded) break;
      await sleep(30 * 1000);
    }

    console.log("[PT-BR] Missão concluída!");
    console.log("[EN-US] Quest completed!");
  };

  heartbeat();
}
