import logging
import re
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class KnowledgeGraphService:
    """
    Relational Knowledge Graph Engine for IP-SAKTI Sahayak.
    Supports live Cypher queries against Neo4j and provides a high-fidelity
    in-memory statutory ontology graph for multi-hop legal reasoning.
    """

    _NEO4J_DRIVER = None
    _NEO4J_CHECKED = False

    # Canonical In-Memory Domain Knowledge Graph (Multi-Hop Triples & Rules)
    # Entity Types: Herb, BioResource, Formulation, ClassicalText, StatuteSection, RegulatoryAuthority, LegalBar
    STATUTORY_KNOWLEDGE_GRAPH = {
        # Botanical Herbs & Classical Linkages
        "ashwagandha": {
            "scientific_name": "Withania somnifera",
            "classical_texts": ["Charaka Samhita", "Bhavaprakasha Nighantu", "Ayurvedic Pharmacopoeia of India"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "KNOWN_TRADITIONAL_KNOWLEDGE", "barrier": "Absolute statutory bar on traditional herbal formulations without novel synergistic extraction."},
                {"section": "Section 6", "act": "Biological Diversity Act, 2023", "relationship": "REQUIRES_NBA_APPROVAL", "barrier": "Form III mandatory prior approval from NBA before patent grant."},
                {"section": "Rule 158-B", "act": "Drugs and Cosmetics Rules, 1945", "relationship": "AYURVEDIC_LICENSING", "barrier": "Must cite classical textual reference for AYUSH manufacturing license."}
            ],
            "synergy_strategies": ["Standardized Withanolide A/B fraction (Rule 122-E)", "Combination with Bio-enhancer Piperine (CI < 1.0)"]
        },
        "turmeric": {
            "scientific_name": "Curcuma longa",
            "classical_texts": ["Sushruta Samhita", "Charaka Samhita", "Ayurvedic Pharmacopoeia of India"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "LANDMARK_TKDL_BAR", "barrier": "CSIR-TKDL landmark wound healing revocation (US Pat No. 5,401,504 precedent)."},
                {"section": "Section 3(e)", "act": "The Patents Act, 1970", "relationship": "MERE_ADMIXTURE_RISK", "barrier": "Simple mixing with other spices/herbs is statutorily rejected as aggregation."},
                {"section": "Section 6", "act": "Biological Diversity Act, 2023", "relationship": "REQUIRES_NBA_APPROVAL", "barrier": "Mandatory Form III clearance for commercial IP rights."}
            ],
            "synergy_strategies": ["Nanocurcumin bio-available complex", "Piperine-Curcumin supra-additive synergy proof (CI < 0.7)"]
        },
        "curcumin": {
            "scientific_name": "Curcuma longa isolate",
            "classical_texts": ["Derived from Curcuma longa in classical texts"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(d)", "act": "The Patents Act, 1970", "relationship": "NEW_FORM_OF_KNOWN_SUBSTANCE", "barrier": "Must prove significant enhancement of therapeutic efficacy over parent Curcumin."},
                {"section": "Rule 122-E", "act": "Drugs and Cosmetics Rules, 1945", "relationship": "PHARMACEUTICAL_REGULATION", "barrier": "Phytopharmaceutical drug protocol required for isolated fractions."}
            ],
            "synergy_strategies": ["Novel targeted liposomal carrier", "Solid lipid nanoparticle formulation with bioavailability AUC > 5x"]
        },
        "neem": {
            "scientific_name": "Azadirachta indica",
            "classical_texts": ["Charaka Samhita", "Sushruta Samhita", "Ashtanga Hridaya"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "HISTORIC_BIOPIRACY_BAR", "barrier": "EPO Neem patent revocation (EP 436257) establishes global TKDL prior-art barrier."},
                {"section": "Section 6", "act": "Biological Diversity Act, 2023", "relationship": "NBA_CLEARANCE_REQUIRED", "barrier": "Indian biological resource clearance Form III mandatory before patent grant."}
            ],
            "synergy_strategies": ["Standardized Azadirachtin micro-emulsion", "Specific synergistic anti-microbial ratio with CI < 0.8"]
        },
        "tulsi": {
            "scientific_name": "Ocimum sanctum",
            "classical_texts": ["Charaka Samhita", "Ayurvedic Pharmacopoeia of India"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "KNOWN_TRADITIONAL_KNOWLEDGE", "barrier": "Codified in classical texts for respiratory and adaptogenic use."},
                {"section": "Section 6", "act": "Biological Diversity Act, 2023", "relationship": "NBA_CLEARANCE_REQUIRED", "barrier": "Access & Benefit Sharing (ABS) compliance required."}
            ],
            "synergy_strategies": ["Standardized Eugenol-rich fraction", "Novel sublingual film delivery system"]
        },
        "brahmi": {
            "scientific_name": "Bacopa monnieri",
            "classical_texts": ["Charaka Samhita", "Sushruta Samhita", "Chakradatta"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "MEDHYA_RASAYANA_BAR", "barrier": "Classical cognitive/memory enhancer; traditional use prevents broad use claims."},
                {"section": "Section 3(e)", "act": "The Patents Act, 1970", "relationship": "ADMIXTURE_BAR", "barrier": "Herbal mixtures require quantitative synergy testing."}
            ],
            "synergy_strategies": ["Bacoside A & B enriched fraction (Rule 122-E)", "Synergistic nootropic composition with documented CI < 0.85"]
        },
        "triphala": {
            "scientific_name": "Emblica officinalis + Terminalia chebula + Terminalia bellirica",
            "classical_texts": ["Charaka Samhita Chikitsasthana", "Sushruta Samhita", "API Part I"],
            "bio_resource": True,
            "statutory_risks": [
                {"section": "Section 3(p)", "act": "The Patents Act, 1970", "relationship": "CLASSICAL_COMPOUND_BAR", "barrier": "Classical 1:1:1 formulation is unpatentable public domain prior art."},
                {"section": "Section 3(e)", "act": "The Patents Act, 1970", "relationship": "MERE_ADMIXTURE", "barrier": "Simple mixing of three fruits is barred as mere aggregation."}
            ],
            "synergy_strategies": ["Non-classical disproportionate ratio showing unexpected synergy", "Controlled-release colon-targeted delivery matrix"]
        }
    }

    # Relational Statute Multi-Hop Map
    STATUTE_RELATIONSHIPS = [
        {
            "from_node": "Indian Biological Resource",
            "relation": "MANDATES_PERMISSION_BEFORE_IP",
            "to_node": "NBA Approval (Section 6, BDA 2023)",
            "statute": "Biological Diversity Act, 2023",
            "mandatory_form": "Form III",
            "penalty_risk": "Patent revocation under Section 64(1)(q) and civil penalties under Section 55A"
        },
        {
            "from_node": "Commercial Herbal Entity",
            "relation": "REQUIRES_PRIOR_INTIMATION",
            "to_node": "State Biodiversity Board (Section 7, BDA 2023)",
            "statute": "Biological Diversity Act, 2023",
            "mandatory_form": "SBB Form I",
            "exemption": "Registered AYUSH Vaidyas and local practitioners are exempt under 2023 amendment"
        },
        {
            "from_node": "Ayurvedic Multi-Herb Composition",
            "relation": "TRIGGERS_REJECTION_UNLESS_SYNERGISTIC",
            "to_node": "Section 3(e) Mere Admixture Bar",
            "statute": "The Patents Act, 1970",
            "overcome_by": "Chou-Talalay Combination Index (CI < 1.0) empirical assay data"
        },
        {
            "from_node": "Classical Formulation in First Schedule",
            "relation": "ABSOLUTE_STATUTORY_BAR",
            "to_node": "Section 3(p) Traditional Knowledge Bar",
            "statute": "The Patents Act, 1970",
            "overcome_by": "Novel delivery system, modified extract under Rule 122-E, or trademark/trade dress"
        },
        {
            "from_node": "Foreign Patent Filing (PCT / Direct)",
            "relation": "REQUIRES_CBD_COMPLIANCE",
            "to_node": "WIPO GRATK Treaty 2024 & Nagoya Protocol",
            "statute": "International Regime",
            "mandatory_disclosure": "Mandatory disclosure of country of origin of genetic resources and traditional knowledge"
        }
    ]

    @classmethod
    def get_neo4j_driver(cls):
        """Initializes Neo4j driver connection with timeout and error resilience."""
        if cls._NEO4J_CHECKED:
            return cls._NEO4J_DRIVER

        if cls._NEO4J_DRIVER is None and settings.NEO4J_URI:
            try:
                from neo4j import GraphDatabase
                cls._NEO4J_DRIVER = GraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASS),
                    connection_timeout=1.0,
                    max_connection_lifetime=60.0
                )
                # Verify connectivity
                cls._NEO4J_DRIVER.verify_connectivity()
                logger.info(f"Connected to Neo4j Graph DB at {settings.NEO4J_URI}")
            except Exception as e:
                logger.debug(f"Neo4j connection not active ({e}). Using in-memory statutory graph engine.")
                cls._NEO4J_DRIVER = None
            finally:
                cls._NEO4J_CHECKED = True
        return cls._NEO4J_DRIVER

    @classmethod
    def query_graph_subgraph(cls, query: str, jurisdiction: str = "IN") -> Dict[str, Any]:
        """
        Executes multi-hop graph traversal for botanical and statutory entities found in query.
        1. Tries live Neo4j Cypher query if available.
        2. Falls back seamlessly to structured high-speed statutory ontology graph.
        Returns:
            {
                "identified_entities": [...],
                "subgraph_triples": [...],
                "statutory_chains": [...],
                "recommended_overcoming_strategies": [...]
            }
        """
        query_lower = query.lower()
        matched_entities = []
        subgraph_triples = []
        statutory_chains = []
        strategies = []

        # 1. Match entities from our canonical statutory ontology
        for entity_key, data in cls.STATUTORY_KNOWLEDGE_GRAPH.items():
            if entity_key in query_lower or data["scientific_name"].lower() in query_lower:
                matched_entities.append({
                    "entity": entity_key.title(),
                    "scientific_name": data["scientific_name"],
                    "classical_sources": data["classical_texts"]
                })

                # Extract risk chains
                for risk in data["statutory_risks"]:
                    chain_desc = f"{entity_key.title()} ({data['scientific_name']}) --[{risk['relationship']}]--> {risk['section']} of {risk['act']}: {risk['barrier']}"
                    statutory_chains.append(chain_desc)
                    subgraph_triples.append({
                        "subject": entity_key.title(),
                        "predicate": risk["relationship"],
                        "object": f"{risk['section']} ({risk['act']})",
                        "barrier_note": risk["barrier"]
                    })

                strategies.extend(data["synergy_strategies"])

        # 2. Match general statutory multi-hop rules
        is_international = jurisdiction in ("INTL", "BOTH") or any(k in query_lower for k in ("pct", "international", "foreign", "fda", "ema", "wipo", "nagoya"))
        for rule in cls.STATUTE_RELATIONSHIPS:
            if is_international and rule["statute"] == "International Regime":
                statutory_chains.append(f"{rule['from_node']} --[{rule['relation']}]--> {rule['to_node']} ({rule['statute']}) [Requirement: {rule['mandatory_disclosure']}]")
                subgraph_triples.append({
                    "subject": rule["from_node"],
                    "predicate": rule["relation"],
                    "object": rule["to_node"],
                    "note": rule["mandatory_disclosure"]
                })
            elif not is_international and rule["statute"] != "International Regime":
                statutory_chains.append(f"{rule['from_node']} --[{rule['relation']}]--> {rule['to_node']} ({rule['statute']})")
                subgraph_triples.append({
                    "subject": rule["from_node"],
                    "predicate": rule["relation"],
                    "object": rule["to_node"],
                    "note": rule.get("penalty_risk") or rule.get("overcome_by") or rule.get("exemption") or ""
                })

        # 3. If Neo4j is available, query live Cypher subgraphs
        driver = cls.get_neo4j_driver()
        if driver:
            try:
                with driver.session() as session:
                    # Cypher query for multi-hop relation lookup
                    cypher_query = """
                    MATCH (e:BotanicalEntity)-[r:GOVERNED_BY|HAS_PRIOR_ART|REQUIRES_CLEARANCE]->(s:StatutoryProvision)
                    WHERE toLower(e.name) IN $entity_names OR toLower(e.scientific_name) IN $entity_names
                    RETURN e.name AS entity, type(r) AS relation, s.section AS section, s.act AS act, s.description AS desc
                    LIMIT 10
                    """
                    entity_names = [e["entity"].lower() for e in matched_entities]
                    if entity_names:
                        records = session.run(cypher_query, entity_names=entity_names)
                        for rec in records:
                            subgraph_triples.append({
                                "subject": rec["entity"],
                                "predicate": rec["relation"],
                                "object": f"{rec['section']} ({rec['act']})",
                                "note": rec.get("desc", "")
                            })
                            statutory_chains.append(f"[Neo4j Live] {rec['entity']} --[{rec['relation']}]--> {rec['section']} ({rec['act']})")
            except Exception as ex:
                logger.debug(f"Neo4j query execution fell back to memory graph: {ex}")

        # Unique strategies
        unique_strategies = list(dict.fromkeys(strategies))

        return {
            "identified_entities": matched_entities,
            "subgraph_triples": subgraph_triples[:8],
            "statutory_chains": statutory_chains[:6],
            "recommended_overcoming_strategies": unique_strategies,
        }
