# Amani Mulira

**Data engineer building reliable infrastructure for ambitious teams.**

I run **[Neo Analytica](https://www.neoanalytica.co.uk)** — an independent data consultancy based in the UK, focused on the messy middle: companies that have outgrown spreadsheets but aren't yet at the scale where a 10-person data team makes sense.

My work sits at the intersection of:

- **Modern warehousing** — Snowflake, BigQuery, dbt
- **Pipeline engineering** — Airflow, Docker, the unglamorous reliability work that makes dashboards trustworthy
- **Analytics that ties out** — revenue numbers that match finance, marketing numbers that match the agency invoice. Boring on purpose.

---

## How I think about data infrastructure

A few opinions that show up in everything I build:

- **Server-side data is the source of truth.** Shopify, Stripe, the database — not whatever the marketing tool is reporting this week.
- **Models should be honest about what they don't know.** No fake joins, no silent fallbacks. A null is more useful than a wrong number.
- **Tests are not optional.** Every primary key is unique, every foreign key resolves, every revenue figure ties out to an authoritative source. CI blocks the merge if it doesn't.
- **The best data stack is the smallest one that does the job.** I'd rather remove a tool than add one.

---

## Selected work

- **[Modern D2C Data Stack](https://github.com/amanimulira/modern-d2c-data-stack)** — Production-grade dbt reference for D2C brands modelling Shopify, Klaviyo, Meta Ads, and GA4. Opinionated, fully tested, documented end-to-end.
- **[ETL Pipeline](https://github.com/amanimulira/ETL-Pipeline)** — dbt + Snowflake pipeline orchestrated with Airflow, containerised with Docker.
- **[SQL Data Warehouse](https://github.com/amanimulira/sql-data-warehouse-project)** — A warehouse built from scratch in SQL Server: ETL, dimensional modelling, analytics layer on top.

More pinned below.

---

## Currently

Taking on a small number of consulting engagements per quarter through Neo Analytica. Best fit: **D2C and e-commerce brands doing $5M–$100M** who need their data to actually agree with itself before they hire a full-time team.

If your dashboards disagree with your accountant, we should probably talk.

---

## Get in touch

- 📧 **[admin@neoanalytica.co.uk](mailto:admin@neoanalytica.co.uk)**
- 💼 **[LinkedIn](https://linkedin.com/in/amanimulira)**
- 📅 **[Book a 30-minute discovery call](https://www.neoanalytica.co.uk/discovery-call)**
