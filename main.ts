import miro from '@mirohq/websdk';

async function getSelectedStickyNotes(): Promise<miro.Item[]> {
  const selection = await miro.board.getSelection();
  return selection.filter(item => item.type === 'sticky_note');
}

function extractNumber(content: string): number {
  const match = content.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

async function createOrUpdateResultStickyNote(id: string, value: number, label: string) {
  const existing = await miro.board.get({ id });
  if (existing.length > 0) {
    await miro.board.sync({
      id,
      content: `<p>${label}: ${value}</p>`
    });
  } else {
    const note = await miro.board.createStickyNote({
      content: `<p>${label}: ${value}</p>`,
      style: {
        fillColor: 'light_green',
        textAlign: 'center',
        textAlignVertical: 'middle'
      },
      x: 0,
      y: 0,
      shape: 'rectangle'
    });
    resultNoteId[label] = note.id;
  }
}

const resultNoteId: Record<string, string> = {};

async function calculate(label: 'Sum' | 'Product') {
  const notes = await getSelectedStickyNotes();
  const values = notes.map(note => extractNumber(note.content));

  const result = label === 'Sum'
    ? values.reduce((a, b) => a + b, 0)
    : values.reduce((a, b) => a * b, 1);

  await createOrUpdateResultStickyNote(resultNoteId[label] || '', result, label);
}

document.getElementById('sumBtn')?.addEventListener('click', () => calculate('Sum'));
document.getElementById('productBtn')?.addEventListener('click', () => calculate('Product'));

// Optional: Polling to keep result updated
setInterval(async () => {
  const notes = await getSelectedStickyNotes();
  if (notes.length > 0) {
    await calculate('Sum');
    await calculate('Product');
  }
}, 5000); // Update every 5 seconds
