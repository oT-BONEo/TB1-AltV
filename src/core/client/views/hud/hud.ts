import * as alt from 'alt-client';
import { commandList } from '../../../shared/commands/commandList';
import { Events_Misc } from '../../../shared/enums/events';
import { View_Events_Chat } from '../../../shared/enums/views';
import { disableAllControls } from '../../utility/disableControls';

const url = `http://resource/client/views/hud/html/index.html`;
let view: alt.WebView;
let isOpen: boolean = false;

alt.onServer(Events_Misc.StartTicks, handleView);
alt.onServer(View_Events_Chat.Append, handleAppend);

async function handleView() {
    if (!view) {
        view = new alt.WebView(url, false);
        view.on('chat:Send', handleNewMessage);
        view.on('chat:Inject', handleInject);
    }

    view.unfocus();
}

/**
 * Sends a chat message up from the WebView to the server chat.ts file.
 * @param {string} message
 */
function handleNewMessage(message: string) {
    disableAllControls(false);
    isOpen = false;

    // Handles Empty Messages
    if (!message) {
        return;
    }

    alt.emitServer(View_Events_Chat.Send, message);
}

/**
 * Appends a chat message to the WebView.
 * @param {string} message
 * @return {*}
 */
function handleAppend(message: string) {
    if (!view) {
        return;
    }

    view.emit('chat:Append', message);
}

function handleInject() {
    const myCommands = commandList.filter(
        (cmd) => cmd.permission === 0 || (alt.Player.local.meta.permissionLevel & cmd.permission) !== 0
    );

    view.emit('chat:Inject', myCommands);
}

export function focusChat() {
    if (!view) {
        return;
    }

    if (isOpen) {
        return;
    }

    if (alt.Player.local.isMenuOpen) {
        return;
    }

    isOpen = true;
    view.emit('chat:Focus');
    disableAllControls(true);
}
