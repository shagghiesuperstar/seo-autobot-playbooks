---
name: entity-and-brand-memory-audit
description: "Use when assistants name competitors and not the user, describe the user wrongly, or recommend the brand only when it is named in the prompt."
metadata:
  version: "1.0.0"
  category: "search-ops"
  collection: "extended"
  source_name: "Entity and brand-memory audit"
  source_path: "search-ops/entity-and-brand-memory-audit/SKILL.md"
  source_template: "Search Ops (agent-template-export v1)"
---

**Original frontmatter (from the export, kept verbatim):**

```yaml
name: Entity and brand-memory audit
description: >-
  Use when assistants name competitors and not the user, describe the user wrongly, or recommend the brand only when it is named in the prompt: audit how consistently the brand, its category, and its facts appear across owned pages, claimable profiles, and reference sources, and prepare the assistant business-profile claims.
```

Inputs: `seo/<site-slug>/kb/brand-ssot.md`, old and alternate brand names, the owned and claimable profiles from memory, the Source map, prompt samples (including how the brand was described), Business Hub discovery topics when available, and Search Console branded-query data.

Rule: pages are cited when searched; brands are named when remembered. Retrieval work wins citations. A consistent, corroborated entity wins the unprompted mention.

## Why the model's memory is a ranking factor

Chen and Koudas (arXiv 2610.15033, 2026-10-10) found ChatGPT writes brands it knows into its own searches, prefers websites it knows, and names brands with no supporting page at all. In controlled tests, brand names reordered its rankings of products with identical facts. A brand the model does not know has to win every retrieval; a brand it knows gets searched for by name.

## Step 1: Write the canonical fact sheet

From the brand SSOT, one block that every other source is compared against: exact brand name and casing, former and alternate names, the category phrase in the buyer's words, one-sentence description, founding year, location or service area, pricing tiers with date, who it is for, who it is not for, and the three facts most often wrong in the samples. Banned public fields stay out.

## Step 2: Compare every source to the sheet

| Layer | Check |
| --- | --- |
| Owned | Homepage title and first paragraph, About, pricing, footer, `Organization` JSON-LD (`name`, `alternateName`, `url`, `logo`, `sameAs`, `description`), docs, press page |
| Claimed | Review-site and directory profiles, marketplace listings, social bios, Google Business Profile, Merchant Center business info, Bing Places, the ChatGPT business profile |
| Reference | Wikipedia and Wikidata entries for the brand and for the category page that lists vendors, industry databases, and long-lived third-party comparisons |
| Community | The threads and reviews the samples cite: is the brand described with the category phrase, or only by name |

Record each mismatch: source, field, what it says, what the sheet says, bucket (Own, Claim, Earn, Contest), and the fix. A name that differs by punctuation or a category phrase that differs by profile is a mismatch.

## Step 3: Check the co-occurrence, not just the name

For the top non-branded prompts, count in the cited third-party pages how often the brand appears next to the category phrase and next to the two closest competitors. Present in zero comparison pages for the category means the model has no reason to recall the brand for it; that is an Earn action for Earned media and data study or honest-link-outreach, not a schema fix.

## Step 4: Prepare the assistant and search profile claims

Hand the operator a checklist; the claims themselves are theirs to make.

ChatGPT Business Hub (beta opened 2026-11-10; read the live help page before starting):

1. Search the business in Business Hub and claim it with one offered method: business phone, business email, website domain (a DNS TXT record), or Shopify.
2. Identity verification through the listed provider is required before publishing changes, viewing insights, connecting a product feed, or creating an agent. It may ask for a government ID and business registration. This is the operator's own act; never handle those documents.
3. If verification is used to create a new profile, approval publishes it automatically, and a published profile cannot be deleted or hidden by support. Have the description, category, logo, delivery and return policy text approved first.
4. Each brand is claimed separately; claiming the main brand does not claim its locations.
5. Claiming does not raise visibility by itself and advertising does not influence independent answers. The gain is correct facts and the Insights numbers.

Google: Google's guide names Merchant Center feeds and Google Business Profile as inputs to product and local information in AI responses, and Business Agent as an optional conversational surface. Check both exist, are verified, and match the sheet.

Bing: Bing Places and Webmaster Tools verified, same facts.

## Step 5: Reference sources

Where a Wikipedia or Wikidata entry exists and is wrong, prepare the correction with independent sources for the operator to request through the proper channel, with the conflict of interest disclosed. Where none exists, do not write one; note what independent coverage would be needed first. Claude and Copilot led with Wikipedia in Meltwater's October 2026 data, so a stale entry carries straight into answers.

## Step 6: Track the memory signal

Two numbers, both first-party: the unprompted mention rate on non-branded clusters from Prompt sampling protocol, and branded-query impressions from Search Console's branded filter. Report each on its own.

## Output

The fact sheet, the mismatch table sorted by how many tracked prompts each source touches, the claim checklist with what is ready and what needs approval, saved dated.

Never claim a profile, submit identity documents, or edit a reference site. Never invent a fact to make sources agree; an unknown stays unknown on the sheet. Never publish a personal name or address in a profile field.


## Where referenced methods live (ULTIMATE SEO/GEO/AEO/AIO AUTOBOT)
Paths are relative to this skill's directory.
- Source map (`source-map`): Read `../seo-autobot-authority/references/source-map.md` (skill `seo-autobot-authority`).
- Earned media and data study (`earned-media-and-data-study`): Read `../seo-autobot-authority/references/earned-media-and-data-study.md` (skill `seo-autobot-authority`).
- `honest-link-outreach`: Read `../seo-autobot-authority/references/honest-link-outreach.md` (skill `seo-autobot-authority`).
- Prompt sampling protocol (`prompt-sampling-protocol`): Read `../seo-autobot-ai-visibility/references/prompt-sampling-protocol.md` (skill `seo-autobot-ai-visibility`).
