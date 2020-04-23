const LOCAL_MODE = false;

export function fetchSearch(searchText, pfSource, cord19Source) {
  return LOCAL_MODE ?
    fetchSearchDemo(searchText, pfSource, cord19Source) :
    fetchSearchRemote(searchText, pfSource, cord19Source);
}

export async function getFacets() {
  return LOCAL_MODE ?
  Promise.resolve(DEMO_FACET_RESULT) :
  fetch("api/facets", { method: "GET" }).then(response => {
    return response.json().then(resultsData => {
      return Promise.resolve(resultsData);
    });
  });
}

export function fetchSearchRemote(searchText, pfSource, cord19Source) {
  const sources = [];
  if (pfSource) {
    sources.push("pf");
  }
  if (cord19Source) {
    sources.push("cord-19");
  }
  const request = {
    "query": searchText,
    "sources": sources
  };
  return fetch("api/contentQuery", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  }).then(response => {
    return response.json().then(resultsData => {
      return Promise.resolve(resultsData);
    });
  });
}

export function fetchSearchDemo(searchText, pfSource, cord19Source) {
  let result = DEMO_QUERY_RESULT;
  result.sort((v1, v2) => {
    let ret;
    if (!v1 || !v1.date) {
      ret = 1;
    }
    if (!v2 || !v2.date) {
      ret = -1;
    }
    ret = v1.date.localeCompare(v2.date);
    return -1 * ret;
  });
  return Promise.resolve(result);
}

export function filterRecord(record, filters) {
  const keys = Object.getOwnPropertyNames(filters);
  let ret = true;
  keys.forEach(k => {
    if (filters[k] && filters[k].length > 0) {
      let recordCheck = false;
      if (record[k]) {
        if (typeof record[k] === 'string' || record[k] instanceof String) {
          if (filters[k].includes(record[k])) {
            recordCheck = true;
          }
        } else {
          record[k].forEach(element => {
            if (filters[k].includes(element)) {
              recordCheck = true;
            }
          });
        }
      }
      ret &= recordCheck;
    }
  });
  return ret;
}

export const DEMO_FACET_RESULT = {
  "purpose": [
      {
          "facet": "Technical Resource",
          "count": 14
      },
      {
          "facet": "Webpage Resource",
          "count": 10
      },
      {
          "facet": "Policy Resource",
          "count": 5
      },
      {
          "facet": "Research Resource",
          "count": 4
      },
      {
          "facet": "Funding & Support Resource",
          "count": 2
      },
      {
          "facet": "News Resource",
          "count": 1
      },
      {
          "facet": "Training Resource",
          "count": 1
      }
  ],
  "tags": [
      {
          "facet": "Workforce Safety & Wellness",
          "count": 21
      },
      {
          "facet": "Management & Administration",
          "count": 18
      },
      {
          "facet": "Health & Medical",
          "count": 15
      },
      {
          "facet": "Supplies & Equipment",
          "count": 12
      },
      {
          "facet": "Leadership",
          "count": 8
      },
      {
          "facet": "Research & Data",
          "count": 5
      },
      {
          "facet": "Legislation & Public Policy",
          "count": 4
      },
      {
          "facet": "Policy or Legal",
          "count": 4
      },
      {
          "facet": "Staffing Strategies",
          "count": 4
      },
      {
          "facet": "Communications",
          "count": 3
      },
      {
          "facet": "Economy & Finance",
          "count": 3
      },
      {
          "facet": "Information Sharing",
          "count": 3
      },
      {
          "facet": "Civil Responses",
          "count": 2
      },
      {
          "facet": "Community Engagement",
          "count": 1
      },
      {
          "facet": "International Issues",
          "count": 1
      },
      {
          "facet": "Tactical Responses",
          "count": 1
      },
      {
          "facet": "Technology",
          "count": 1
      }
  ]
};

export const DEMO_QUERY_RESULT = [
  {
      "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
      "tags": [
          "Health & Medical",
          "Workforce Safety & Wellness"
      ],
      "owner": "World Health Organization (WHO)",
      "purpose": "Webpage Resource",
      "type": "text/html",
      "description": "Word Health Organization Coronavirus disease (COVID-19) Pandemic Website",
      "title": "Coronavirus disease 2019",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/index.html",
      "tags": [
          "Workforce Safety & Wellness",
          "Health & Medical",
          "Management & Administration"
      ],
      "owner": "Centers for Disease Control (CDC)",
      "purpose": "Webpage Resource",
      "type": "text/html",
      "description": "CDC Coronavirus (COVID-19) Website",
      "title": "Coronavirus Disease 2019 (COVID-19) | CDC",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.fema.gov/coronavirus/best-practices",
      "tags": [
          "Economy & Finance",
          "Legislation & Public Policy",
          "Policy or Legal",
          "Community Engagement"
      ],
      "owner": "Federal Emergency Management Agency (FEMA)",
      "purpose": "Webpage Resource",
      "type": "text/html",
      "description": "FEMA Best Practices Site",
      "title": "Coronavirus Emergency Management Best Practices | FEMA.gov",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.policeforum.org/coronavirus",
      "tags": [
          "Workforce Safety & Wellness",
          "Leadership",
          "Management & Administration"
      ],
      "owner": "Police Executive Research Forum (PERF)",
      "purpose": "Webpage Resource",
      "type": "application/xhtml+xml",
      "description": "Responding to the COVID-19 Coronavirus",
      "title": "Responding to the COVID-19 coronavirus",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://repository.netecweb.org/exhibits/show/ncov/item/688",
      "tags": [
          "Supplies & Equipment",
          "Workforce Safety & Wellness",
          "Health & Medical"
      ],
      "owner": "National Emerging Special Pathogens Training and Education Center (NETEC)",
      "purpose": "Technical Resource",
      "type": "text/html",
      "description": "National Emerging Special Pathogen Training and Education Center",
      "title": "NETEC: Personal Protective Equipment for 2019 Novel Coronavirus (COVID-19) · NETEC Repository",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.epa.gov/pesticide-registration/list-n-disinfectants-use-against-sars-cov-2",
      "tags": [
          "Workforce Safety & Wellness",
          "Health & Medical"
      ],
      "owner": "Environmental Protection Agency (EPA)",
      "purpose": "Technical Resource",
      "type": "text/html",
      "description": "List N: Disinfectants for Use Against SARS-CoV-2",
      "title": "List N: Disinfectants for Use Against SARS-CoV-2 | Pesticide Registration | US EPA",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/faq.html",
      "tags": [
          "Workforce Safety & Wellness",
          "Health & Medical",
          "Management & Administration"
      ],
      "owner": "Centers for Disease Control (CDC)",
      "purpose": "Webpage Resource",
      "type": "text/html",
      "description": "CDC Coronavirus (COVID-19) FAQ Site",
      "title": "Frequently Asked Questions | CDC",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/hcp/ppe-strategy/burn-calculator.html",
      "tags": [
          "Supplies & Equipment",
          "Management & Administration"
      ],
      "owner": "Centers for Disease Control (CDC)",
      "purpose": "Technical Resource",
      "type": "text/html",
      "description": "Personal Protective Equipment (PPE) Burn Rate Calculator",
      "title": "Personal Protective Equipment (PPE) Burn Rate Calculator | CDC",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.myiacp.org/COVID19libraryofresources",
      "tags": [
          "Workforce Safety & Wellness",
          "Management & Administration",
          "Leadership"
      ],
      "owner": "International Association of Chiefs of Police (IACP)",
      "purpose": "Webpage Resource",
      "type": "text/html",
      "description": "IACP Coronavirus COVID-19 Resource Library",
      "title": "COVID-19 Library of Resources - Community Hub",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/hcp/release-stockpiled-N95.html",
      "tags": [
          "Supplies & Equipment",
          "Workforce Safety & Wellness",
          "Health & Medical"
      ],
      "owner": "Centers for Disease Control (CDC)",
      "purpose": "Technical Resource",
      "type": "text/html",
      "description": "Release of Stockpiled N95 Filtering Facepiece Respirators Beyond the Manufacturer-Designated Shelf Life: Considerations for the COVID-19 Response",
      "title": "Release of Stockpiled N95 Filtering Facepiece Respirators Beyond the Manufacturer-Designated Shelf L",
      "date": "2020-04-12",
      "source": "pf"
  },
  {
      "url": "https://doi.org/10.1007/bf01314455",
      "tags": [
          "Research & Data"
      ],
      "owner": "G C Smith, T L Lester, R L I-Ieberlii~g, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus-like particles in nonhuman primate feces",
      "title": "Coronavirus-like particles in nonhuman primate feces",
      "date": "1982",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " S. Dea,  R. S.  Roy,  M. A. S. Y.  Elazhary",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus-like Particles in the Feces of a Cat with Diarrhea",
      "title": "Coronavirus-like Particles in the Feces of a Cat with Diarrhea",
      "date": "1982-05-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/s0195-5616(93)50001-3",
      "tags": [
          "Research & Data"
      ],
      "owner": "Johnny D Hoskins",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Infection in Cats",
      "title": "Coronavirus Infection in Cats",
      "date": "1993-01-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/emi.2017.37",
      "tags": [
          "Research & Data"
      ],
      "owner": "Patrick Cy Woo, Susanna Kp Lau, Chi-Ching Tsang, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus HKU15 in respiratory tract of pigs and first discovery of coronavirus quasispecies in 5′-untranslated region",
      "title": "Coronavirus HKU15 in respiratory tract of pigs and first discovery of coronavirus quasispecies in 5′-untranslated region",
      "date": "2017-06-21",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virusres.2014.09.016",
      "tags": [
          "Research & Data"
      ],
      "owner": "Sing To, Mei Fung, Ding Xiang Huang, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus-induced ER stress response and its involvement in regulation of coronavirus–host interactions",
      "title": "Coronavirus-induced ER stress response and its involvement in regulation of coronavirus–host interactions",
      "date": "2014-12-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.2807/1560-7917.es.2020.25.11.2000230",
      "tags": [
          "Research & Data"
      ],
      "owner": "Emanuele Nicastri, Alessandra D'abramo, Giovanni Faggioni³, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus disease (COVID-19) in a paucisymptomatic patient: epidemiological and clinical challenge in settings with limited community transmission, Italy, February 2020",
      "title": "Coronavirus disease (COVID-19) in a paucisymptomatic patient: epidemiological and clinical challenge in settings with limited community transmission, Italy, February 2020",
      "date": "2020-03-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/s00018-007-7103-1",
      "tags": [
          "Research & Data"
      ],
      "owner": "D X Liu, Q Yuan, Y Liao",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus envelope protein: A small membrane protein with multiple functions",
      "title": "Coronavirus envelope protein: A small membrane protein with multiple functions",
      "date": "2007-05-29",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.acra.2020.03.003",
      "tags": [
          "Research & Data"
      ],
      "owner": "Mingzhi Li, Pinggui Lei, Bingliang Zeng, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Disease (COVID-19): Spectrum of CT Findings and Temporal Progression of the Disease",
      "title": "Coronavirus Disease (COVID-19): Spectrum of CT Findings and Temporal Progression of the Disease",
      "date": "2020-03-20",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/d41586-020-00589-1",
      "tags": [
          "Research & Data"
      ],
      "owner": "Nature",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus nixes conference, twilight zone beckons and a faded star brightens",
      "title": "Coronavirus nixes conference, twilight zone beckons and a faded star brightens",
      "date": "2020-03-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " Cornelis A. M. de Haan,  Lili  Kuo,  Paul S.  Masters, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Particle Assembly: Primary Structure Requirements of the Membrane Protein",
      "title": "Coronavirus Particle Assembly: Primary Structure Requirements of the Membrane Protein",
      "date": "1998-08-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virusres.2014.07.024",
      "tags": [
          "Research & Data"
      ],
      "owner": "Marta L Dediego, Jose L Nieto-Torres, Jose M Jimenez-Guardeño, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus virulence genes with main focus on SARS-CoV envelope gene",
      "title": "Coronavirus virulence genes with main focus on SARS-CoV envelope gene",
      "date": "2014-12-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.00407-08",
      "tags": [
          "Research & Data"
      ],
      "owner": " Etienne Decroly,  Isabelle  Imbert,  Bruno  Coutard, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Nonstructural Protein 16 Is a Cap-0 Binding Enzyme Possessing (Nucleoside-2′O)-Methyltransferase Activity",
      "title": "Coronavirus Nonstructural Protein 16 Is a Cap-0 Binding Enzyme Possessing (Nucleoside-2′O)-Methyltransferase Activity",
      "date": "2008-04-16",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virol.2012.07.005",
      "tags": [
          "Research & Data"
      ],
      "owner": "Carmina Verdiá -Bá Guena, Jose L Nieto-Torres, Antonio Alcaraz, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus E protein forms ion channels with functionally and structurally-involved membrane lipids",
      "title": "Coronavirus E protein forms ion channels with functionally and structurally-involved membrane lipids",
      "date": "2012-10-25",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0882-4010(87)90066-0",
      "tags": [
          "Research & Data"
      ],
      "owner": "Ehud Lavi,'*', Akin Suzumura, Mikio Hirayama, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus mouse hepatitis virus (MHV)-A59 causes a persistent, productive infection in primary glial cell cultures",
      "title": "Coronavirus mouse hepatitis virus (MHV)-A59 causes a persistent, productive infection in primary glial cell cultures",
      "date": "1987-08-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/bf01538652",
      "tags": [
          "Research & Data"
      ],
      "owner": "Alan Y Sakaguchi, Thomas B Shows",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus 229E susceptibility in man-mouse hybrids is located on human chromosome 15",
      "title": "Coronavirus 229E susceptibility in man-mouse hybrids is located on human chromosome 15",
      "date": "1982",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.00017-08",
      "tags": [
          "Research & Data"
      ],
      "owner": " John Bechill,  Zhongbin  Chen,  Joseph W.  Brewer, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Infection Modulates the Unfolded Protein Response and Mediates Sustained Translational Repression",
      "title": "Coronavirus Infection Modulates the Unfolded Protein Response and Mediates Sustained Translational Repression",
      "date": "2008-02-27",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1993.1109",
      "tags": [
          "Research & Data"
      ],
      "owner": "Yun Wang, Barbara Detrick, ! And, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus (JHM) Replication within the Retina: Analysis of Cell Tropism in Mouse Retinal Cell Cultures",
      "title": "Coronavirus (JHM) Replication within the Retina: Analysis of Cell Tropism in Mouse Retinal Cell Cultures",
      "date": "1993-03-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.ympev.2005.03.030",
      "tags": [
          "Research & Data"
      ],
      "owner": "Wen-Xin Zheng, Ling-Ling Chen, Hong-Yu Ou, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus phylogeny based on a geometric approach",
      "title": "Coronavirus phylogeny based on a geometric approach",
      "date": "2005-08-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virol.2017.10.004",
      "tags": [
          "Research & Data"
      ],
      "owner": "Yong Wah Tan, To Sing Fung, Hongyuan Shen, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus infectious bronchitis virus non-structural proteins 8 and 12 form stable complex independent of the non-translated regions of viral RNA and other viral proteins",
      "title": "Coronavirus infectious bronchitis virus non-structural proteins 8 and 12 form stable complex independent of the non-translated regions of viral RNA and other viral proteins",
      "date": "2018-01-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " S R Compton,  C B  Stephensen,  S W  Snyder, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus species specificity: murine coronavirus binds to a mouse-specific epitope on its carcinoembryonic antigen-related receptor glycoprotein.",
      "title": "Coronavirus species specificity: murine coronavirus binds to a mouse-specific epitope on its carcinoembryonic antigen-related receptor glycoprotein.",
      "date": "1992-12-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1080/01478885.2020.1734718",
      "tags": [
          "Research & Data"
      ],
      "owner": " Anthony F. Henwood",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus disinfection in histopathology",
      "title": "Coronavirus disinfection in histopathology",
      "date": "2020-03-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/3-540-26765-4_1",
      "tags": [
          "Research & Data"
      ],
      "owner": "D A Brian, R S Baric",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Genome Structure and Replication",
      "title": "Coronavirus Genome Structure and Replication",
      "date": "2005",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " S G Sawicki,  D L  Sawicki",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus minus-strand RNA synthesis and effect of cycloheximide on coronavirus RNA synthesis.",
      "title": "Coronavirus minus-strand RNA synthesis and effect of cycloheximide on coronavirus RNA synthesis.",
      "date": "1986-01-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1101/2020.04.03.003699",
      "tags": [
          "Research & Data"
      ],
      "owner": "Yifei Lang, Wentao Li, Zeshi Li, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus hemagglutinin-esterase and spike proteins co-evolve for functional balance and optimal virion avidity",
      "title": "Coronavirus hemagglutinin-esterase and spike proteins co-evolve for functional balance and optimal virion avidity",
      "date": "2020-04-05",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.3389/fmicb.2014.00296",
      "tags": [
          "Research & Data"
      ],
      "owner": "To S Fung, Ding X Liu",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus infection, ER stress, apoptosis and innate immunity",
      "title": "Coronavirus infection, ER stress, apoptosis and innate immunity",
      "date": "2014-06-17",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.amjmed.2015.05.034",
      "tags": [
          "Research & Data"
      ],
      "owner": "Geoffrey J Gorse, Mary M Donovan, Gira B Patel, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus and Other Respiratory Illnesses Comparing Older with Young Adults",
      "title": "Coronavirus and Other Respiratory Illnesses Comparing Older with Young Adults",
      "date": "2015-11-30",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " X Zhang,  C L  Liao,  M M  Lai",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus leader RNA regulates and initiates subgenomic mRNA transcription both in trans and in cis.",
      "title": "Coronavirus leader RNA regulates and initiates subgenomic mRNA transcription both in trans and in cis.",
      "date": "1994-08-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1177/0022034520914246",
      "tags": [
          "Research & Data"
      ],
      "owner": " L. Meng,  F.  Hua,  Z.  Bian",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Disease 2019 (COVID-19): Emerging and Future Challenges for Dental and Oral Medicine",
      "title": "Coronavirus Disease 2019 (COVID-19): Emerging and Future Challenges for Dental and Oral Medicine",
      "date": "2020-03-12",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " Stuart G. Siddell,  Helmut  Wege,  Andrea  Barthel, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus JHM: Cell-Free Synthesis of Structural Protein p60",
      "title": "Coronavirus JHM: Cell-Free Synthesis of Structural Protein p60",
      "date": "1980-01-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0022-2836(81)90463-0",
      "tags": [
          "Research & Data"
      ],
      "owner": "H Niemann, H.-D Klenk",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus glycoprotein E1, a new type of viral glycoprotein",
      "title": "Coronavirus glycoprotein E1, a new type of viral glycoprotein",
      "date": "1981-12-25",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/0-387-25518-4_46",
      "tags": [
          "Research & Data"
      ],
      "owner": "Fumihiro Taguchi",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Receptors",
      "title": "Coronavirus Receptors",
      "date": "2005",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jcm.02614-05",
      "tags": [
          "Research & Data"
      ],
      "owner": " Susanna K. P. Lau,  Patrick C. Y.  Woo,  Cyril C. Y.  Yip, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus HKU1 and Other Coronavirus Infections in Hong Kong",
      "title": "Coronavirus HKU1 and Other Coronavirus Infections in Hong Kong",
      "date": "2006-06-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1996.0118",
      "tags": [
          "Research & Data"
      ],
      "owner": "Seok Yong, John F Repass, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Transcription Mediated by Sequences Flanking the Transcription Consensus Sequence",
      "title": "Coronavirus Transcription Mediated by Sequences Flanking the Transcription Consensus Sequence",
      "date": "1996-03-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1994.1383",
      "tags": [
          "Research & Data"
      ],
      "owner": " Stanley M. Tahara,  Therese A.  Dietlin,  Cornelia C.  Bergmann, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Translational Regulation: Leader Affects mRNA Efficiency",
      "title": "Coronavirus Translational Regulation: Leader Affects mRNA Efficiency",
      "date": "1994-08-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/0-387-25518-4_44",
      "tags": [
          "Research & Data"
      ],
      "owner": "Regina C Armstrong, Jeffrey M Redwine, Donna J Messersmith",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus-Induced Demyelination and Spontaneous Remyelination: Growth factor expression and function",
      "title": "Coronavirus-Induced Demyelination and Spontaneous Remyelination: Growth factor expression and function",
      "date": "2005",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " Pierre Baudoux,  Charles  Carrat,  Lydia  Besnardeau, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Pseudoparticles Formed with Recombinant M and E Proteins Induce Alpha Interferon Synthesis by Leukocytes",
      "title": "Coronavirus Pseudoparticles Formed with Recombinant M and E Proteins Induce Alpha Interferon Synthesis by Leukocytes",
      "date": "1998-11-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/3-7643-7339-3_2",
      "tags": [
          "Research & Data"
      ],
      "owner": "A Schmidt, M H Wolff, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus infections in veterinary medicine",
      "title": "Coronavirus infections in veterinary medicine",
      "date": "2005",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " P B Sethna,  D A  Brian",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus genomic and subgenomic minus-strand RNAs copartition in membrane-protected replication complexes.",
      "title": "Coronavirus genomic and subgenomic minus-strand RNAs copartition in membrane-protected replication complexes.",
      "date": "1997-10-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1021/cen-09809-buscon1",
      "tags": [
          "Research & Data"
      ],
      "owner": "",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus cancels chemical events",
      "title": "Coronavirus cancels chemical events",
      "date": "2020-03-09",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.3390/v2081803",
      "tags": [
          "Research & Data"
      ],
      "owner": "Patrick C Y Woo, Yi Huang, Susanna K P Lau, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Genomics and Bioinformatics Analysis",
      "title": "Coronavirus Genomics and Bioinformatics Analysis",
      "date": "2010-08-24",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/s2468-2667(20)30051-7",
      "tags": [
          "Research & Data"
      ],
      "owner": " Marc Fadel,  Jérôme  Salomon,  Alexis  Descatha",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus outbreak: the role of companies in preparedness and responses",
      "title": "Coronavirus outbreak: the role of companies in preparedness and responses",
      "date": "2020-02-28",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " D F Stern,  S I  Kennedy",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus multiplication strategy. II. Mapping the avian infectious bronchitis virus intracellular RNA species to the genome.",
      "title": "Coronavirus multiplication strategy. II. Mapping the avian infectious bronchitis virus intracellular RNA species to the genome.",
      "date": "1980-11-10",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " Sungwhan An,  Akihiko  Maeda,  Shinji  Makino",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Transcription Early in Infection",
      "title": "Coronavirus Transcription Early in Infection",
      "date": "1998-11-10",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1080/13550280490280292",
      "tags": [
          "Research & Data"
      ],
      "owner": "Sonia Navas-Martín, Susan R Weiss",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus replication and pathogenesis: Implications for the recent outbreak of severe acute respiratory syndrome (SARS), and the challenge for vaccine development",
      "title": "Coronavirus replication and pathogenesis: Implications for the recent outbreak of severe acute respiratory syndrome (SARS), and the challenge for vaccine development",
      "date": "2004",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.jacr.2020.02.008",
      "tags": [
          "Research & Data"
      ],
      "owner": "Soheil Kooraki, Melina Hosseiny, Lee Myers, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus (COVID-19) Outbreak: What the Department of Radiology Should Know",
      "title": "Coronavirus (COVID-19) Outbreak: What the Department of Radiology Should Know",
      "date": "2020-04-30",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0168-1702(86)90037-7",
      "tags": [
          "Research & Data"
      ],
      "owner": "David Cavanagh', Philip J Davis, I Darryl, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus IBV: Partial amino terminal sequencing of spike polypeptide S2 identifies the sequence Arg-Arg-Phe-Arg-Arg at the cleavage site of the spike precursor propolypeptide of IBV strains Beaudette and M41",
      "title": "Coronavirus IBV: Partial amino terminal sequencing of spike polypeptide S2 identifies the sequence Arg-Arg-Phe-Arg-Arg at the cleavage site of the spike precursor propolypeptide of IBV strains Beaudette and M41",
      "date": "1986-02-28",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.2214/ajr.20.23034",
      "tags": [
          "Research & Data"
      ],
      "owner": " Sana Salehi,  Aidin  Abedi,  Sudheer  Balakrishnan, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Disease 2019 (COVID-19): A Systematic Review of Imaging Findings in 919 Patients",
      "title": "Coronavirus Disease 2019 (COVID-19): A Systematic Review of Imaging Findings in 919 Patients",
      "date": "2020-03-14",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "Research & Data"
      ],
      "owner": " Adrian Cho",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus just caused the American Physical Society to cancel its biggest meeting of the year | Science | AAAS",
      "title": "Coronavirus just caused the American Physical Society to cancel its biggest meeting of the year | Science | AAAS",
      "date": "2020",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.78.7.3398-3406.2004",
      "tags": [
          "Research & Data"
      ],
      "owner": " Yun Li,  Li  Fu,  Donna M.  Gonzales, et al",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus Neurovirulence Correlates with the Ability of the Virus To Induce Proinflammatory Cytokine Signals from Astrocytes and Microglia",
      "title": "Coronavirus Neurovirulence Correlates with the Ability of the Virus To Induce Proinflammatory Cytokine Signals from Astrocytes and Microglia",
      "date": "2004-03-11",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/d41586-020-00154-w",
      "tags": [
          "Research & Data"
      ],
      "owner": "",
      "purpose": "Research Resource",
      "type": "text/html",
      "description": "Coronavirus latest: Trump requests $2.5 billion for coronavirus response",
      "title": "Coronavirus latest: Trump requests $2.5 billion for coronavirus response",
      "date": "2020-03-17",
      "source": "cord-19"
  }
];