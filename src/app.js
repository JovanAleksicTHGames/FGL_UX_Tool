document.addEventListener('DOMContentLoaded', () => {
    const multiplyBtn = document.getElementById('multiply-btn');

    if (!multiplyBtn) {
        console.error('Multiply button not found.');
        return;
    }

    multiplyBtn.addEventListener('click', async () => {
        try {
            const selection = await miro.board.getSelection();

            if (!selection || selection.length === 0) {
                miro.showNotification('No items selected. Please select some sticky notes.');
                return;
            }

            // Filter for sticky notes only
            const stickyNotes = selection.filter(item => item.type === 'sticky_note');

            if (stickyNotes.length < 2) {
                miro.showNotification('Please select at least two sticky notes with numbers.');
                return;
            }

            // Extract valid numbers from sticky notes
            const numbers = stickyNotes
                .map(note => {
                    const cleaned = note.plainText.replace(/[^\d.-]/g, '');
                    const parsed = parseFloat(cleaned);
                    return isNaN(parsed) ? null : parsed;
                })
                .filter(n => n !== null);

            if (numbers.length < 2) {
                miro.showNotification('Not enough valid numbers found in sticky notes.');
                return;
            }

            // Generate all pairwise multiplication results
            const results = [];
            numbers.forEach((a, i) => {
                numbers.slice(i + 1).forEach(b => {
                    results.push(a * b);
                });
            });

            // Position results on board
            let x = 100;
            let y = 100;

            for (const result of results) {
                await miro.board.createStickyNote({
                    content: `Result: ${result}`,
                    x: x,
                    y: y,
                    style: {
                        fillColor: 'light_yellow',
                    },
                });

                // Arrange notes in grid
                x += 200;
                if (x > 1000) {
                    x = 100;
                    y += 200;
                }
            }

            miro.showNotification('Multiplications completed!');
        } catch (error) {
            console.error('Error during multiplication:', error);
            miro.showNotification('Something went wrong while multiplying.');
        }
    });
});
