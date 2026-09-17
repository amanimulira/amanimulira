"""Build the downloadable CVs from the same verified employment history.

Requires reportlab and pdfplumber. Outputs drafts to output/pdf; review before copying
them to assets. Keep workplace claims separate from independent project work.
"""

import argparse
from pathlib import Path

import pdfplumber
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
INK = colors.HexColor("#202b38")
MUTED = colors.HexColor("#526171")
BLUE = colors.HexColor("#204f80")
LINE = colors.HexColor("#cbd4dd")

STYLES = {
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=24, leading=27, textColor=INK, spaceAfter=5),
    "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=BLUE, spaceAfter=7),
    "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=8.6, leading=12, textColor=MUTED),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=13, textColor=INK, spaceAfter=4),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=10, leading=13, textColor=INK, leftIndent=10, firstLineIndent=-10, spaceAfter=4),
    "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=BLUE, spaceBefore=10, spaceAfter=4, keepWithNext=True),
    "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=INK, spaceAfter=3, keepWithNext=True),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9.2, leading=12.5, textColor=INK, spaceAfter=4),
}

# Confirmed professional responsibilities. Capacity is an estimate against the
# previous process, not a claim of realised cash savings or headcount reductions.
EXPERIENCE = [
    "<b>FP&amp;A reporting:</b> Managed budgeting and forecasting reporting end to end with Financial Planning &amp; Analysis, from collecting submissions and preparing inputs through validation and Power BI delivery, reducing preparation effort and uncertainty around inputs.",
    "<b>Financial control:</b> Established working capital reports and ledger-level cost reporting to support VAT requirements, giving Finance teams clearer access to consistent cost detail.",
    "<b>Commercial analytics:</b> Built cost value reconciliation (CVR) and commercial reports covering labour, subcontractor and material spend by location, trade and operative. Translated Excel KPI logic into DAX measures for large-contract performance reviews.",
    "<b>BI modelling &amp; controls:</b> Created Power BI semantic models from application data, Excel, SharePoint and SQL datasets, applying reconciliation and data-quality checks before figures reached reporting outputs.",
    "<b>Operational business case:</b> Evaluated automated invoice processing against baseline productivity to estimate the staffing capacity required for additional volume and support a board-level investment case. Tracked accuracy, supplier patterns and workflow bottlenecks.",
    "<b>Cross-functional delivery:</b> Translated Finance, Operations and Processing questions into technical requirements, KPI logic and usable reports; communicated definitions and data-quality issues clearly across teams.",
]

VERSIONS = {
    "Commercial-Finance-Data-Analyst": {
        "role": "COMMERCIAL FINANCE DATA ANALYST | BI &amp; ANALYTICS ENGINEERING",
        "profile": "Commercial Finance Data Analyst with an MEng in Computer Science with Artificial Intelligence, delivering reporting across FP&amp;A, working capital, contract costs and operational performance at Wates Group. Builds validated Power BI semantic models and reporting workflows from Excel, SharePoint, application and SQL data, translating commercial questions into clear KPI logic and decision-ready reporting.",
        "skills": [
            "<b>BI &amp; data modelling:</b> Power BI, DAX, Power Query, SQL datasets, Excel, SharePoint, semantic modelling, data validation and reconciliation.",
            "<b>Commercial finance:</b> FP&amp;A reporting, working capital, CVR, ledger-level cost analysis, contract KPIs and operational business cases. <b>Project tools:</b> Python, dbt, DuckDB, Databricks, Spark and GitHub Actions.",
        ],
        "projects": [
            ("D2C Marketing Performance Analytics", "Built 31 dbt models and 137 automated tests across four illustrative commerce sources for acquisition cost, return on ad spend and retention analysis. <link href='https://github.com/amanimulira/D2C-Data-Stack' color='#204f80'>Repository</link>"),
            ("Supply Chain Performance Analysis", "Developed a simulated solution covering demand, inventory, stockouts, shipment delays and supplier risk; translated forecasting and inventory outputs into business-facing KPIs."),
        ],
    },
    "Analytics-Engineer": {
        "role": "ANALYTICS ENGINEERING | JUNIOR DATA ENGINEERING",
        "profile": "Finance Data Analyst building Power BI semantic models and managing reporting workflows from application data to validated outputs. Independent SQL, Python, dbt and Databricks projects extend this commercial foundation into tested models, traceable transformations and reproducible pipelines.",
        "skills": [
            "<b>Workplace:</b> Power BI, SQL datasets, Excel, SharePoint, semantic models, data validation, reporting requirements and stakeholder communication.",
            "<b>Personal projects:</b> SQL, Python, dbt, DuckDB, Snowflake, Databricks, Spark, Delta Lake, Airflow, Docker, GitHub Actions, dimensional modelling and automated testing.",
        ],
        "projects": [
            ("D2C Analytics Engineering Platform", "Built 31 dbt models and 137 automated tests across staging, intermediate and mart layers using illustrative commerce data; local DuckDB build under 60 seconds. <link href='https://github.com/amanimulira/D2C-Data-Stack' color='#204f80'>Repository</link>"),
            ("Supply Chain Lakehouse", "Designed Bronze, Silver and Gold layers for a simulated supply-chain dataset, with inventory and supplier-risk transformations and an MLflow-tracked LightGBM forecasting workflow."),
            ("AML Transaction Monitoring", "Built Spark feature, scoring and alert workflows for approximately 203,000 transactions. Synthetic labels demonstrate the method, not production detection performance. <link href='https://github.com/amanimulira/crypto-aml-pipeline' color='#204f80'>Repository</link>"),
        ],
    },
}


def paragraph(text, style="body"):
    return Paragraph(text, STYLES[style])


def section(title):
    return [paragraph(title, "section"), HRFlowable(width="100%", thickness=0.5, color=LINE, spaceAfter=6)]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED)
    canvas.setFont("CVSans", 8)
    canvas.drawString(42, 23, "Amani Mulira | Curriculum Vitae")
    canvas.drawRightString(A4[0] - 42, 23, str(doc.page))
    canvas.restoreState()


def build(name, content):
    path = OUTPUT / f"Amani-Mulira-{name}-CV.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, topMargin=34, bottomMargin=37, leftMargin=42, rightMargin=42,
                            title=f"Amani Mulira - {name.replace('-', ' ')} CV", author="Amani Mulira")
    story = [paragraph("AMANI MULIRA", "name"), paragraph(content["role"], "role"),
             paragraph("London, UK | +44 (0) 7731 814161 | <link href='mailto:amanimulira@gmail.com' color='#204f80'>amanimulira@gmail.com</link>", "contact"),
             paragraph("<link href='https://www.linkedin.com/in/amanimulira' color='#204f80'>linkedin.com/in/amanimulira</link> | <link href='https://github.com/amanimulira' color='#204f80'>github.com/amanimulira</link> | <link href='https://amanimulira.github.io/amanimulira/' color='#204f80'>Portfolio</link>", "contact"),
             Spacer(1, 9), HRFlowable(width="100%", thickness=1, color=BLUE)]
    story += section("PROFILE") + [paragraph(content["profile"])]
    story += section("PROFESSIONAL EXPERIENCE")
    story += [paragraph("Finance Data Analyst | Wates Group / WPS", "heading"), paragraph("London, UK | Aug 2025 - Present", "small")]
    story += [paragraph("- " + text, "bullet") for text in EXPERIENCE]
    story += section("SKILLS") + [paragraph(text, "small") for text in content["skills"]]
    story += section("SELECTED PERSONAL PROJECTS")
    for title, text in content["projects"]:
        story.append(KeepTogether([paragraph(title, "heading"), paragraph(text, "small")]))
    story.append(KeepTogether(section("EDUCATION") + [paragraph("<b>MEng Computer Science with Artificial Intelligence</b> | University of Liverpool | 2025", "small")]))
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    with pdfplumber.open(path) as pdf:
        pages = len(pdf.pages)
    print(f"{path.name}: {pages} page(s)")
    if pages != 1:
        raise ValueError(f"Review content and spacing: {path.name} should fit one readable page, got {pages}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--font-dir", type=Path, required=True, help="Directory containing LiberationSans-Regular.ttf and LiberationSans-Bold.ttf")
    parser.add_argument("--version", choices=VERSIONS, action="append", help="Build only the selected CV version; repeat to build more than one")
    args = parser.parse_args()
    pdfmetrics.registerFont(TTFont("CVSans", str(args.font_dir / "LiberationSans-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("CVSans-Bold", str(args.font_dir / "LiberationSans-Bold.ttf")))
    pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold", italic="CVSans", boldItalic="CVSans-Bold")
    for style in STYLES.values():
        style.fontName = "CVSans-Bold" if style.fontName.endswith("Bold") else "CVSans"
    OUTPUT.mkdir(parents=True, exist_ok=True)
    selected = args.version or list(VERSIONS)
    for version in selected:
        build(version, VERSIONS[version])
