from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "NudgeHQ_Content_Creator_One_Pager.pdf"

PAGE_WIDTH, PAGE_HEIGHT = landscape(letter)

BG = colors.HexColor("#F7F7FD")
CARD = colors.white
TEXT = colors.HexColor("#1F2430")
MUTED = colors.HexColor("#677084")
PURPLE = colors.HexColor("#7F77DD")
DEEP = colors.HexColor("#1A1035")
MINT = colors.HexColor("#E4FBF2")
MINT_TEXT = colors.HexColor("#179D71")
PINK = colors.HexColor("#FFE4EE")
PINK_TEXT = colors.HexColor("#D93A77")
BORDER = colors.HexColor("#E6E6FA")
SOFT = colors.HexColor("#F2F0FF")
INDIA = colors.HexColor("#F2994A")
INDIA_GREEN = colors.HexColor("#27AE60")

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CardBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=12.2,
        textColor=TEXT,
        alignment=TA_LEFT,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="BulletBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.8,
        leading=11.5,
        textColor=TEXT,
        leftIndent=10,
        bulletIndent=0,
        spaceAfter=2,
    )
)


def draw_round_rect(c, x, y, w, h, fill, stroke=BORDER, radius=20, line=1):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(line)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def draw_brand_icon(c, x, y, size):
    draw_round_rect(c, x, y, size, size, DEEP, PURPLE, radius=size * 0.2, line=1.5)
    c.setStrokeColor(PURPLE)
    c.setLineWidth(size * 0.08)
    c.setLineCap(1)
    c.line(x + size * 0.28, y + size * 0.2, x + size * 0.28, y + size * 0.78)
    c.line(x + size * 0.28, y + size * 0.78, x + size * 0.62, y + size * 0.2)
    c.line(x + size * 0.61, y + size * 0.2, x + size * 0.61, y + size * 0.78)
    c.setFillColor(PURPLE)
    c.roundRect(x + size * 0.72, y + size * 0.18, size * 0.12, size * 0.12, size * 0.03, fill=1, stroke=0)


def draw_paragraph(c, text, x, y, w, style):
    para = Paragraph(text, style)
    _, h = para.wrap(w, 1000)
    para.drawOn(c, x, y - h)
    return h


def draw_bullet_list(c, items, x, y, w):
    current_y = y
    for item in items:
        h = draw_paragraph(c, f"<bullet>&bull;</bullet>{item}", x, current_y, w, styles["BulletBody"])
        current_y -= h + 1
    return y - current_y


def draw_chip(c, x, y, text, fill=SOFT, text_color=PURPLE):
    pad_x = 10
    h = 20
    width = stringWidth(text, "Helvetica-Bold", 8.5) + pad_x * 2
    draw_round_rect(c, x, y - h, width, h, fill, fill, radius=10, line=0)
    c.setFillColor(text_color)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x + pad_x, y - 13.5, text)
    return width


def fit_text(c, text, font_name, max_size, min_size, max_width):
    size = max_size
    while size > min_size and stringWidth(text, font_name, size) > max_width:
        size -= 0.2
    return size


def draw_card(c, x, y, w, h, eyebrow, title, body=None, bullets=None, accent=PURPLE):
    draw_round_rect(c, x, y - h, w, h, CARD, BORDER, radius=20, line=1)
    c.setFillColor(accent)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x + 16, y - 18, eyebrow.upper())
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(x + 16, y - 40, title)
    cursor_y = y - 52
    if body:
      used = draw_paragraph(c, body, x + 16, cursor_y, w - 32, styles["CardBody"])
      cursor_y -= used + 6
    if bullets:
      draw_bullet_list(c, bullets, x + 16, cursor_y, w - 32)


def generate():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=(PAGE_WIDTH, PAGE_HEIGHT))
    c.setTitle("NudgeHQ Content Creator One Pager")
    c.setAuthor("NudgeHQ")
    c.setSubject("Simple branded summary for content creators")
    c.setCreator("Codex for NudgeHQ")

    c.setFillColor(BG)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    margin = 28
    hero_h = 122
    draw_round_rect(c, margin, PAGE_HEIGHT - margin - hero_h, PAGE_WIDTH - margin * 2, hero_h, colors.HexColor("#F9FAFF"), BORDER, radius=26, line=1)

    draw_brand_icon(c, margin + 18, PAGE_HEIGHT - margin - 70, 44)
    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(margin + 74, PAGE_HEIGHT - margin - 28, "NudgeHQ")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 10.5)
    c.drawString(margin + 74, PAGE_HEIGHT - margin - 46, "Simple brand summary for content creators")

    chip_x = PAGE_WIDTH - margin - 228
    chip_y = PAGE_HEIGHT - margin - 22
    chip_x += draw_chip(c, chip_x, chip_y, "Less chasing. More clarity.")
    chip_x += 8
    draw_chip(c, chip_x, chip_y, "Proudly made in India", fill=MINT, text_color=MINT_TEXT)

    c.setFillColor(TEXT)
    c.setFont("Helvetica-Bold", 25)
    c.drawString(margin + 18, PAGE_HEIGHT - margin - 82, "A smarter daily work system for modern teams.")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 11)
    c.drawString(margin + 18, PAGE_HEIGHT - margin - 101, "NudgeHQ helps teams share updates, track tasks, surface blockers, and give managers clarity without constant follow-up.")

    left_x = margin
    gutter = 18
    top_y = PAGE_HEIGHT - margin - hero_h - 18
    left_w = 350
    right_w = PAGE_WIDTH - margin * 2 - left_w - gutter

    draw_card(
        c,
        left_x,
        top_y,
        left_w,
        132,
        "What we solve",
        "We remove work chaos.",
        body="Many teams waste time asking for updates again and again. NudgeHQ puts updates, tasks, blockers, and action in one clean place so everyone stays aligned.",
        bullets=[
            "Managers do not need to chase every person for status.",
            "Employees know where to update and what matters.",
            "Founders get visibility without checking many tools.",
        ],
        accent=PURPLE,
    )

    draw_card(
        c,
        left_x,
        top_y - 148,
        left_w,
        124,
        "Motto, aim, vision",
        "Built to make work feel lighter.",
        bullets=[
            "<b>Motto:</b> Less chasing. More clarity. Better work.",
            "<b>Aim:</b> Make daily work simple, clear, and easy to manage.",
            "<b>Vision:</b> Create a calmer work system where teams move with focus, not confusion.",
        ],
        accent=PINK_TEXT,
    )

    draw_card(
        c,
        left_x,
        top_y - 288,
        left_w,
        116,
        "How to explain it simply",
        "What each person gets",
        bullets=[
            "<b>Employees:</b> a place to update work, manage tasks, and stay organized.",
            "<b>Managers:</b> a dashboard that shows who updated, who is stuck, and what needs action.",
            "<b>Admins/Founders:</b> a clear view of team activity, setup, and momentum.",
        ],
        accent=INDIA,
    )

    right_x = left_x + left_w + gutter
    right_top = top_y
    right_card_h = 180
    draw_round_rect(c, right_x, right_top - right_card_h, right_w, right_card_h, DEEP, DEEP, radius=24, line=0)
    c.setFillColor(colors.HexColor("#8EF0C0"))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(right_x + 18, right_top - 20, "WHY IT FEELS DIFFERENT")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(right_x + 18, right_top - 48, "Not just a task app.")
    body = (
        "NudgeHQ mixes team updates, personal planning, manager visibility, and AI help in one workspace. "
        "That is why it feels like a daily work operating system, not just another boring dashboard."
    )
    draw_paragraph(c, body, right_x + 18, right_top - 62, right_w - 36, styles["CardBody"].clone("DarkBody", textColor=colors.white, leading=13))

    inner_y = right_top - 112
    stat_w = (right_w - 54) / 3
    stats = [
        ("Social + U Space", "team + personal focus"),
        ("Manager clarity", "updates + action"),
        ("NudgeAI help", "clean updates + summaries"),
    ]
    for i, (label, sub) in enumerate(stats):
        x = right_x + 18 + i * (stat_w + 9)
        draw_round_rect(c, x, inner_y - 42, stat_w, 42, colors.HexColor("#2B2050"), colors.HexColor("#3D3368"), radius=16, line=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", fit_text(c, label, "Helvetica-Bold", 8.8, 7.4, stat_w - 24))
        c.drawString(x + 12, inner_y - 17, label)
        c.setFillColor(colors.HexColor("#D4CEFB"))
        c.setFont("Helvetica", fit_text(c, sub, "Helvetica", 7.2, 6.3, stat_w - 24))
        c.drawString(x + 12, inner_y - 30, sub)

    draw_card(
        c,
        right_x,
        right_top - right_card_h - 16,
        right_w * 0.56 - 8,
        170,
        "New features",
        "What we recently added",
        bullets=[
            "Manager Morning Brief for quick daily priorities",
            "No Update Alert for missing updates",
            "One-click Escalate Blocker for urgent issues",
            "Proof Required Tasks before review",
            "Smart Task Templates and better dashboard graphs",
        ],
        accent=MINT_TEXT,
    )

    draw_card(
        c,
        right_x + right_w * 0.56 + 10,
        right_top - right_card_h - 16,
        right_w * 0.44 - 10,
        170,
        "Reel angles",
        "Simple content hooks",
        bullets=[
            "\"This app stops managers from chasing updates all day.\"",
            "\"One place to see who is working, who is stuck, and what got done.\"",
            "\"Less confusion. Less follow-up. Better work flow.\"",
        ],
        accent=PURPLE,
    )

    footer_y = 24
    c.setStrokeColor(BORDER)
    c.line(margin, footer_y + 18, PAGE_WIDTH - margin, footer_y + 18)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(margin, footer_y, "Best one-line description: NudgeHQ helps teams work clearly by bringing updates, tasks, blockers, and manager action into one smart workspace.")
    c.setFillColor(INDIA_GREEN)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(PAGE_WIDTH - margin, footer_y, "Proudly made in India")

    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    generate()
