(() => {
    const { patcher, metro } = vendetta;

    const MessageActions = metro.findByProps("sendMessage");

    if (!MessageActions?.sendMessage) return;

    let targetUserIds = [];

    patcher.before("sendMessage", MessageActions, (args) => {
        const message = args?.[1];

        if (!message?.content) return;

        const content = message.content;

        // Tìm tất cả mention trong tin nhắn
        const mentions = [...content.matchAll(/<@!?(\d+)>/g)];

        // Nếu có mention → cập nhật target
        if (mentions.length > 0) {
            targetUserIds = [...new Set(mentions.map(m => m[1]))];

            // Xóa mention khỏi vị trí ban đầu
            const cleanContent = content
                .replace(/<@!?\d+>/g, "")
                .replace(/\s+/g, " ")
                .trim();

            const targets = targetUserIds
                .map(id => "<@" + id + ">")
                .join(" ");

            message.content =
                "# " + cleanContent + " " + targets;

            return;
        }

        // Những tin nhắn sau tự động mention target ở cuối
        if (targetUserIds.length > 0) {
            const targets = targetUserIds
                .map(id => "<@" + id + ">")
                .join(" ");

            message.content =
                "# " + content + " " + targets;
        } else {
            // Chưa có target
            message.content =
                "# " + content;
        }
    });
})();
