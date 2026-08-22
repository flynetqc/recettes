import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GroceryAisle, GroceryCompiledItem, Recipe } from './types';

export function exportGroceryListPdf({
  itemsByAisle,
  recipeSummary,
  weekTitle = 'Menu & Épicerie de la semaine'
}: {
  itemsByAisle: Record<GroceryAisle, GroceryCompiledItem[]>;
  recipeSummary: { recipe: Recipe; multiplier: number }[];
  weekTitle?: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor: [number, number, number] = [16, 185, 129]; // Emerald 500
  const darkColor: [number, number, number] = [31, 41, 55]; // Gray 800
  const mutedColor: [number, number, number] = [107, 114, 128]; // Gray 500

  // Compact Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 13, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text("Liste d'épicerie et menu de la semaine", 14, 8.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Généré le ${dateStr}`, 145, 8.5);

  let currentY = 20;

  // Recipe badges summary
  if (recipeSummary.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mutedColor);
    doc.text('Recettes sélectionnées au menu :', 14, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);

    const recipesText = recipeSummary
      .map(r => `• ${r.recipe.title} (${r.multiplier * r.recipe.servings} portions)`)
      .join('   |   ');

    const splitText = doc.splitTextToSize(recipesText, 180);
    doc.text(splitText, 14, currentY);
    currentY += splitText.length * 5 + 6;
  }

  // Iterate over aisles and print tables for items to buy only
  const aisles = Object.keys(itemsByAisle) as GroceryAisle[];

  for (const aisle of aisles) {
    // Only include items that are NOT checked (not already at home)
    const itemsToBuy = (itemsByAisle[aisle] || []).filter(item => !item.checked);
    if (itemsToBuy.length === 0) continue;

    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    // Aisle Section Title (clean standard characters without special unicode glyphs)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`${aisle} (${itemsToBuy.length})`, 14, currentY);
    currentY += 3;

    const tableRows = itemsToBuy.map(item => {
      // Prioritize standard packaging rule (ex: 1 sac de 3 livres) or display quantity
      const qteAAcheter = item.purchase_package_label
        ? item.purchase_package_label.replace('Acheter : ', '')
        : item.display_quantity_str || '1 unité';

      let sourceRecipes = '';
      if (item.recipes_sources.length > 0) {
        sourceRecipes = item.recipes_sources.map(s => s.recipe_title).join(', ');
      } else if (item.is_custom) {
        sourceRecipes = 'Article libre';
      }

      return [
        '[  ]',
        item.name,
        qteAAcheter,
        sourceRecipes
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['', 'Article à acheter', 'Quantité à acheter', 'Recettes associées']],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [55, 65, 81],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 60, fontStyle: 'bold' },
        2: { cellWidth: 50, fontStyle: 'bold', textColor: [16, 185, 129] },
        3: { cellWidth: 'auto', textColor: [107, 114, 128] }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y ? data.cursor.y + 7 : currentY + 15;
      }
    });
  }

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} sur ${pageCount} — Mes Recettes Gourmandes`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `liste_epicerie_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
