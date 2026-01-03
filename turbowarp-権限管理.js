(function(Scratch) {
  'use strict';

  class PermissionExtension {
    constructor() {
      this.permissions = {};
      this.roles = [
        "管理者",
        "通常権限",
        "編集のみ(非推奨)",
        "表示のみ(推奨)",
        "全て(非推奨)"
      ];
      this.messages = ["myselif"]; // 初期メッセージ
      this.sentMessages = []; // 送信されたメッセージログ
    }

    getInfo() {
      return {
        id: "permissionExtension",
        name: "権限管理",
        blocks: [
          {
            opcode: "addMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "新しいメッセージ [MESSAGE] を追加する",
            arguments: {
              MESSAGE: { type: Scratch.ArgumentType.STRING }
            }
          },
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "メッセージ [MESSAGE] を送信する",
            arguments: {
              MESSAGE: { type: Scratch.ArgumentType.STRING, menu: "messages" }
            }
          },
          {
            opcode: "grantPermission",
            blockType: Scratch.BlockType.COMMAND,
            text: "このスプライトに [MESSAGE] に対する [ROLE] の権限を与える。",
            arguments: {
              MESSAGE: { type: Scratch.ArgumentType.STRING, menu: "messages" },
              ROLE: { type: Scratch.ArgumentType.STRING, menu: "roles" }
            }
          },
          {
            opcode: "whenHasPermission",
            blockType: Scratch.BlockType.HAT,
            text: "[MESSAGE] を受け取った時 [ROLE] の権限があるなら実行する",
            arguments: {
              MESSAGE: { type: Scratch.ArgumentType.STRING, menu: "messages" },
              ROLE: { type: Scratch.ArgumentType.STRING, menu: "roles" }
            }
          }
        ],
        menus: {
          roles: {
            acceptReporters: true,
            items: this.roles
          },
          messages: {
            acceptReporters: true,
            items: () => this.messages.map(m => ({ text: m, value: m }))
          }
        }
      };
    }

    // 新しいメッセージを追加
    addMessage(args) {
      const msg = args.MESSAGE.trim();
      if (msg && !this.messages.includes(msg)) {
        this.messages.push(msg);
      }
    }

    // メッセージ送信
    sendMessage(args) {
      const msg = args.MESSAGE;
      if (msg) {
        this.sentMessages.push(msg);
      }
    }

    // 権限付与
    grantPermission(args, util) {
      const sprite = util.target.sprite.name;
      const msg = args.MESSAGE;
      const role = args.ROLE;

      if (!this.permissions[sprite]) {
        this.permissions[sprite] = {};
      }
      if (!this.permissions[sprite][msg]) {
        this.permissions[sprite][msg] = [];
      }

      if (!this.permissions[sprite][msg].includes(role)) {
        this.permissions[sprite][msg].push(role);
      }
    }

    // 権限チェック＋メッセージ受信
    whenHasPermission(args, util) {
      const sprite = util.target.sprite.name;
      const msg = args.MESSAGE;
      const role = args.ROLE;

      // 「全て(非推奨)」は常に許可
      if (role === "全て(非推奨)") return true;

      // メッセージが送信されていなければ発火しない
      if (!this.sentMessages.includes(msg)) return false;

      const perms = this.permissions[sprite]?.[msg] || [];
      return perms.includes(role);
    }
  }

  Scratch.extensions.register(new PermissionExtension());
})(Scratch);

