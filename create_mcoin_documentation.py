from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

OUTPUT = r"C:\Users\DABC\AppData\Local\Temp\Cart_MCoin_Implementation_Documentation.docx"

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)

def borders(cell, color='D9D9D9'):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in('w:tcBorders')
    if tc_borders is None:
        tc_borders = OxmlElement('w:tcBorders')
        tc_pr.append(tc_borders)
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        tag = 'w:' + edge
        element = tc_borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            tc_borders.append(element)
        element.set(qn('w:val'), 'single')
        element.set(qn('w:sz'), '4')
        element.set(qn('w:color'), color)

def set_cell_text(cell, text, bold=False, color=None):
    cell.text = ''
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    r.bold = bold
    r.font.size = Pt(9.5)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    borders(cell)

def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f'Heading {level}')
    p.paragraph_format.space_before = Pt(14 if level == 1 else 9)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(text)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_bullet(doc, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.add_run(text)

doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.75)
section.bottom_margin = Inches(0.7)
section.left_margin = Inches(0.8)
section.right_margin = Inches(0.8)

styles = doc.styles
styles['Normal'].font.name = 'Aptos'
styles['Normal']._element.rPr.rFonts.set(qn('w:ascii'), 'Aptos')
styles['Normal']._element.rPr.rFonts.set(qn('w:hAnsi'), 'Aptos')
styles['Normal'].font.size = Pt(10.5)
styles['Normal'].paragraph_format.space_after = Pt(6)
for style_name in ('Title', 'Heading 1', 'Heading 2'):
    style = styles[style_name]
    style.font.name = 'Aptos Display' if style_name == 'Title' else 'Aptos'
    style._element.rPr.rFonts.set(qn('w:ascii'), style.font.name)
    style._element.rPr.rFonts.set(qn('w:hAnsi'), style.font.name)
    style.font.color.rgb = RGBColor(0, 0, 0)

title = doc.add_paragraph(style='Title')
title.alignment = WD_ALIGN_PARAGRAPH.LEFT
title.paragraph_format.space_after = Pt(5)
title.add_run('Cart M Coin Implementation Documentation')
subtitle = doc.add_paragraph()
subtitle.paragraph_format.space_after = Pt(14)
r = subtitle.add_run('Cart API totals, M Coin redemption, and payable amount details')
r.italic = True
r.font.size = Pt(11)

p = doc.add_paragraph()
p.add_run('Purpose. ').bold = True
p.add_run('This document records the cart-side changes for M Coin application and the payable amount breakdown. The implementation is shared by the cart slide, full cart page, and cart summary component so that the customer sees consistent values and behavior in every cart view.')

add_heading(doc, 'Files Updated')
table = doc.add_table(rows=1, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit = False
table.columns[0].width = Inches(2.85)
table.columns[1].width = Inches(4.0)
for cell, text in zip(table.rows[0].cells, ['File', 'Responsibility']):
    set_cell_text(cell, text, True, 'FFFFFF')
    shade(cell, '1F4E78')
for file_name, detail in [
    ('src/components/CartSlide.jsx', 'Slide-out cart M Coin UI, amount entry, available value display, and payable tooltip.'),
    ('src/pages/Cart.jsx', 'Full cart summary M Coin UI and payable tooltip.'),
    ('src/components/CartSummary.jsx', 'Reusable cart summary M Coin UI and payable tooltip.'),
    ('CartService.php', 'Cart response additions for subtotal and payable breakdown values.'),
    ('src/styles/mainStyle.css', 'Shared hover and keyboard-focus styling for the payable information tooltip.'),
]:
    cells = table.add_row().cells
    set_cell_text(cells[0], file_name)
    set_cell_text(cells[1], detail)

add_heading(doc, 'Cart API Response Changes')
doc.add_paragraph('The cart response is now the source of truth for the cart subtotal and the payable breakdown. The UI reads these values instead of recreating the totals from cart rows where the server already provides the calculated result.')
for text in [
    'cart_sub_total_amount is assigned to the cart subtotal state used by the cart slide.',
    'payable_breakdown returns cash and carry amount, other item subtotal amount, overdue amount, and credit limit excess amount.',
    'The breakdown is displayed on demand through the Total Payable information tooltip. Any applied M Coin discount is included as a separate line in the tooltip.',
]:
    add_bullet(doc, text)

add_heading(doc, 'M Coin Amount Entry')
doc.add_paragraph('The redemption field accepts a rupee amount. The field is initially populated from the M Coins earned by the current order, converted at 250 M Coins per rupee. This initial value is shown as a formatted amount in the text box.')
formula = doc.add_paragraph()
formula.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = formula.add_run('Prefilled amount = floor earnMCoinBalance / 250')
run.bold = True
run.font.size = Pt(11)
formula2 = doc.add_paragraph()
formula2.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = formula2.add_run('Applied M Coins = entered amount x 250')
run.bold = True
run.font.size = Pt(11)
doc.add_paragraph('The visible M Coin count beside Apply M Coin Amount updates from the entered amount. When the customer applies the amount, the request sends the corresponding M Coin count in applied_m_coins.')

add_heading(doc, 'M Coin Limits and Applied State')
for text in [
    'The maximum amount the user may enter is derived from availableMCoinBalance, converted to rupees at 250 M Coins per rupee.',
    'The input is editable even though it has a calculated starting value. Entry is clamped to the permitted maximum and is validated before applying.',
    'When M Coins are already applied, the mcoin-apply section is hidden and the applied amount with a delete action is shown instead.',
    'After removal succeeds, saved applied coins are cleared and the mcoin-apply section becomes visible again automatically.',
]:
    add_bullet(doc, text)

add_heading(doc, 'Available Coin Display')
doc.add_paragraph('The wallet display uses the same order in all three cart views: Available Coin Value shows the available balance in rupees, followed by the raw available M Coin total.')
table = doc.add_table(rows=1, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
for cell, text in zip(table.rows[0].cells, ['Display item', 'Value shown']):
    set_cell_text(cell, text, True, 'FFFFFF')
    shade(cell, '1F4E78')
for left, right in [
    ('Available Coin Value', 'Rupee value of availableMCoinBalance divided by 250.'),
    ('Available M Coins', 'Raw availableMCoinBalance value followed by M Coins.'),
    ('Applied Coins', 'Saved applied coin count and its rupee discount.'),
]:
    cells = table.add_row().cells
    set_cell_text(cells[0], left)
    set_cell_text(cells[1], right)

add_heading(doc, 'Total Payable Information Tooltip')
doc.add_paragraph('An information icon appears beside Total Payable in the cart slide, Cart page, and CartSummary component. Hovering over the icon, or focusing it by keyboard, shows the server-provided split of the payable amount.')
for text in [
    'Cash and Carry items',
    'Other item subtotal',
    'Overdue amount',
    'Credit limit excess',
    'M Coin discount, when M Coins are applied',
]:
    add_bullet(doc, text)

add_heading(doc, 'Validation and Expected Behavior')
table = doc.add_table(rows=1, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
for cell, text in zip(table.rows[0].cells, ['Scenario', 'Expected result']):
    set_cell_text(cell, text, True, 'FFFFFF')
    shade(cell, '1F4E78')
for scenario, result in [
    ('Cart loads', 'Subtotal and payable breakdown are populated from the cart API response.'),
    ('Customer edits the amount', 'The displayed M Coin count is recalculated as amount x 250.'),
    ('Amount exceeds available balance', 'The value is limited and validation prevents redemption beyond the allowed amount.'),
    ('Customer applies M Coins', 'The API receives applied_m_coins; the discount updates Total Payable.'),
    ('Customer deletes applied M Coins', 'The applied state clears and the amount entry form returns.'),
    ('Customer hovers over Total Payable icon', 'The payable components and M Coin discount, if present, are displayed.'),
]:
    cells = table.add_row().cells
    set_cell_text(cells[0], scenario)
    set_cell_text(cells[1], result)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer_run = footer.add_run('Cart M Coin implementation documentation')
footer_run.font.size = Pt(8)
footer_run.font.color.rgb = RGBColor(100, 100, 100)

doc.core_properties.title = 'Cart M Coin Implementation Documentation'
doc.core_properties.subject = 'Cart M Coin application and payable amount changes'
doc.core_properties.author = 'Mazing Business'
doc.save(OUTPUT)
print(OUTPUT)
