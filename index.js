// index.js
miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openModal({ url: 'index.html' });
});

