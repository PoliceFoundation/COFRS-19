export function fetchSearch(searchText, pfSource, cord19Source) {
  return fetchSearchRemote(searchText, pfSource, cord19Source);
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
  let result = DEMO_RESULT;
  result.sort((v1, v2) => {
    let ret;
    if (!v1 || !v1.date) {
      ret = 1;
    }
    if (!v2 || !v2.date) {
      ret = -1;
    }
    ret = v1.date.localeCompare(v2.date);
    return -1*ret;
  });
  return Promise.resolve(result);
}

export function getSidebarItems(results, sidebarItem) {
  const ret = new Set();
  results.forEach((result) => {
    result[sidebarItem].filter(item => {
      return item && item !== '';
    }).forEach((item) => {
      ret.add(item);
    });
  });
  return [...ret].sort();
}

export function filterRecord(record, filters) {
  const keys = Object.getOwnPropertyNames(filters);
    let ret = true;
    keys.forEach(k => {
      if (filters[k] && filters[k].length > 0) {
        let recordCheck = false;
        record[k].forEach(element => {
          if (filters[k].includes(element)) {
            recordCheck = true;
          }
        });
        ret &= recordCheck;
      }
    });
    return ret;
}

export const DEMO_RESULT = [
  {
      "url": "https://www.epa.gov/pesticide-registration/list-n-disinfectants-use-against-sars-cov-2",
      "tags": [
          "EPA",
          "Disinfect",
          "Cleaner",
          "Infection Control"
      ],
      "owner": "EPA",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "List N: Disinfectants for Use Against SARS-CoV-2",
      "title": "List N: Disinfectants for Use Against SARS-CoV-2 | Pesticide Registration | US EPA",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
      "tags": [
          "WHO",
          "World Health Organization",
          "Medical",
          "Infection Control",
          "Contagion",
          "Guidance",
          "Recommendations"
      ],
      "owner": "WHO",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "Word Health Organization",
      "title": "Coronavirus disease 2019",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/index.html",
      "tags": [
          "CDC",
          "Medical",
          "Infection Control",
          "Contagion",
          "Guidance",
          "Recommendations"
      ],
      "owner": "CDC",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "Primary CDC Site",
      "title": "Coronavirus Disease 2019 (COVID-19) | CDC",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.fema.gov/coronavirus/best-practices",
      "tags": [
          "FEMA"
      ],
      "owner": "FEMA",
      "purpose": [
          "Best Practices"
      ],
      "type": "text/html",
      "description": "FEMA Best Practices Site",
      "title": "Coronavirus Best Practices | FEMA.gov",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://repository.netecweb.org/exhibits/show/ncov/item/688",
      "tags": [
          "CDC",
          "Medical",
          "Infection Control",
          "Contagion",
          "Guidance",
          "Recommendations",
          "N95",
          "PPE",
          "Personal Protective Equipment",
          "Respirator",
          "NETEC"
      ],
      "owner": "NETEC",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "National Emerging Special Pathogen Training and Education Center",
      "title": "NETEC: Personal Protective Equipment for 2019 Novel Coronavirus (COVID-19) · NETEC Repository",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.policeforum.org/coronavirus",
      "tags": [
          "PERF",
          "Police Executive Research Forum",
          "Best Practices"
      ],
      "owner": "PERF",
      "purpose": [
          "Policy",
          "Best Practice",
          ""
      ],
      "type": "application/xhtml+xml",
      "description": "NaN",
      "title": "Responding to the COVID-19 coronavirus",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/faq.html",
      "tags": [
          "CDC",
          "Medical",
          "Infection Control",
          "Contagion",
          "Guidance",
          "Recommendations",
          "FAQ"
      ],
      "owner": "CDC",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "CDC FAQ Site",
      "title": "Frequently Asked Questions | CDC",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.cdc.gov/coronavirus/2019-ncov/hcp/respirators-strategy/index.html",
      "tags": [
          "CDC",
          "Medical",
          "Infection Control",
          "Contagion",
          "Guidance",
          "Recommendations",
          "N95",
          "PPE",
          "Personal Protective Equipment",
          "Respirator"
      ],
      "owner": "CDC",
      "purpose": [
          "Technical Guidance",
          "Policy",
          ""
      ],
      "type": "text/html",
      "description": "CDC Strategies for Optimizing the Supply of N95 Respirators",
      "title": "Strategies for Optimizing the Supply of N95 Respirators: COVID-19 | CDC",
      "date": "2020-04-04",
      "source": "pf"
  },
  {
      "url": "https://www.hhs.gov/sites/default/files/covid-19-hipaa-and-first-responders-508.pdf",
      "tags": [
          "HIPAA",
          "Privacy",
          "Informtion Sharing",
          "Civil Rights"
      ],
      "owner": "HHS",
      "purpose": [
          "Policy",
          "Best Practice",
          ""
      ],
      "type": "application/pdf",
      "description": "COVID-19 and HIPAA: Disclosures to law enforcement, paramedics, other first responders and public health authorities",
      "title": "COVID-19 and HIPAA: Disclosures to law enforcement, paramedics, other first responders and public he",
      "date": "2020-03-24",
      "source": "pf"
  },
  {
      "url": "https://doi.org/10.1007/bf01314455",
      "tags": [
          "CORD-19"
      ],
      "owner": "G C Smith, T L Lester, R L I-Ieberlii~g, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus-like particles in nonhuman primate feces",
      "title": "Coronavirus-like particles in nonhuman primate feces",
      "date": "1982",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " S. Dea,  R. S.  Roy,  M. A. S. Y.  Elazhary",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus-like Particles in the Feces of a Cat with Diarrhea",
      "title": "Coronavirus-like Particles in the Feces of a Cat with Diarrhea",
      "date": "1982-05-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/s0195-5616(93)50001-3",
      "tags": [
          "CORD-19"
      ],
      "owner": "Johnny D Hoskins",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Infection in Cats",
      "title": "Coronavirus Infection in Cats",
      "date": "1993-01-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/emi.2017.37",
      "tags": [
          "CORD-19"
      ],
      "owner": "Patrick Cy Woo, Susanna Kp Lau, Chi-Ching Tsang, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus HKU15 in respiratory tract of pigs and first discovery of coronavirus quasispecies in 5′-untranslated region",
      "title": "Coronavirus HKU15 in respiratory tract of pigs and first discovery of coronavirus quasispecies in 5′-untranslated region",
      "date": "2017-06-21",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virusres.2014.09.016",
      "tags": [
          "CORD-19"
      ],
      "owner": "Sing To, Mei Fung, Ding Xiang Huang, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus-induced ER stress response and its involvement in regulation of coronavirus–host interactions",
      "title": "Coronavirus-induced ER stress response and its involvement in regulation of coronavirus–host interactions",
      "date": "2014-12-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.2807/1560-7917.es.2020.25.11.2000230",
      "tags": [
          "CORD-19"
      ],
      "owner": "Emanuele Nicastri, Alessandra D'abramo, Giovanni Faggioni³, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus disease (COVID-19) in a paucisymptomatic patient: epidemiological and clinical challenge in settings with limited community transmission, Italy, February 2020",
      "title": "Coronavirus disease (COVID-19) in a paucisymptomatic patient: epidemiological and clinical challenge in settings with limited community transmission, Italy, February 2020",
      "date": "2020-03-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/s00018-007-7103-1",
      "tags": [
          "CORD-19"
      ],
      "owner": "D X Liu, Q Yuan, Y Liao",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus envelope protein: A small membrane protein with multiple functions",
      "title": "Coronavirus envelope protein: A small membrane protein with multiple functions",
      "date": "2007-05-29",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.acra.2020.03.003",
      "tags": [
          "CORD-19"
      ],
      "owner": "Mingzhi Li, Pinggui Lei, Bingliang Zeng, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Disease (COVID-19): Spectrum of CT Findings and Temporal Progression of the Disease",
      "title": "Coronavirus Disease (COVID-19): Spectrum of CT Findings and Temporal Progression of the Disease",
      "date": "2020-03-20",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/d41586-020-00589-1",
      "tags": [
          "CORD-19"
      ],
      "owner": "Nature",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus nixes conference, twilight zone beckons and a faded star brightens",
      "title": "Coronavirus nixes conference, twilight zone beckons and a faded star brightens",
      "date": "2020-03-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " Cornelis A. M. de Haan,  Lili  Kuo,  Paul S.  Masters, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Particle Assembly: Primary Structure Requirements of the Membrane Protein",
      "title": "Coronavirus Particle Assembly: Primary Structure Requirements of the Membrane Protein",
      "date": "1998-08-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virusres.2014.07.024",
      "tags": [
          "CORD-19"
      ],
      "owner": "Marta L Dediego, Jose L Nieto-Torres, Jose M Jimenez-Guardeño, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus virulence genes with main focus on SARS-CoV envelope gene",
      "title": "Coronavirus virulence genes with main focus on SARS-CoV envelope gene",
      "date": "2014-12-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.00407-08",
      "tags": [
          "CORD-19"
      ],
      "owner": " Etienne Decroly,  Isabelle  Imbert,  Bruno  Coutard, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Nonstructural Protein 16 Is a Cap-0 Binding Enzyme Possessing (Nucleoside-2′O)-Methyltransferase Activity",
      "title": "Coronavirus Nonstructural Protein 16 Is a Cap-0 Binding Enzyme Possessing (Nucleoside-2′O)-Methyltransferase Activity",
      "date": "2008-04-16",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virol.2012.07.005",
      "tags": [
          "CORD-19"
      ],
      "owner": "Carmina Verdiá-Báguena, Jose L Nieto-Torres, Antonio Alcaraz, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus E protein forms ion channels with functionally and structurally-involved membrane lipids",
      "title": "Coronavirus E protein forms ion channels with functionally and structurally-involved membrane lipids",
      "date": "2012-10-25",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0882-4010(87)90066-0",
      "tags": [
          "CORD-19"
      ],
      "owner": "Ehud Lavi,'*', Akin Suzumura, Mikio Hirayama, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus mouse hepatitis virus (MHV)-A59 causes a persistent, productive infection in primary glial cell cultures",
      "title": "Coronavirus mouse hepatitis virus (MHV)-A59 causes a persistent, productive infection in primary glial cell cultures",
      "date": "1987-08-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1007/bf01538652",
      "tags": [
          "CORD-19"
      ],
      "owner": "Alan Y Sakaguchi, Thomas B Shows",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus 229E susceptibility in man-mouse hybrids is located on human chromosome 15",
      "title": "Coronavirus 229E susceptibility in man-mouse hybrids is located on human chromosome 15",
      "date": "1982",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.00017-08",
      "tags": [
          "CORD-19"
      ],
      "owner": " John Bechill,  Zhongbin  Chen,  Joseph W.  Brewer, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Infection Modulates the Unfolded Protein Response and Mediates Sustained Translational Repression",
      "title": "Coronavirus Infection Modulates the Unfolded Protein Response and Mediates Sustained Translational Repression",
      "date": "2008-02-27",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1993.1109",
      "tags": [
          "CORD-19"
      ],
      "owner": "Yun Wang, Barbara Detrick, ! And, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus (JHM) Replication within the Retina: Analysis of Cell Tropism in Mouse Retinal Cell Cultures",
      "title": "Coronavirus (JHM) Replication within the Retina: Analysis of Cell Tropism in Mouse Retinal Cell Cultures",
      "date": "1993-03-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.ympev.2005.03.030",
      "tags": [
          "CORD-19"
      ],
      "owner": "Wen-Xin Zheng, Ling-Ling Chen, Hong-Yu Ou, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus phylogeny based on a geometric approach",
      "title": "Coronavirus phylogeny based on a geometric approach",
      "date": "2005-08-31",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.virol.2017.10.004",
      "tags": [
          "CORD-19"
      ],
      "owner": "Yong Wah Tan, To Sing Fung, Hongyuan Shen, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus infectious bronchitis virus non-structural proteins 8 and 12 form stable complex independent of the non-translated regions of viral RNA and other viral proteins",
      "title": "Coronavirus infectious bronchitis virus non-structural proteins 8 and 12 form stable complex independent of the non-translated regions of viral RNA and other viral proteins",
      "date": "2018-01-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " S R Compton,  C B  Stephensen,  S W  Snyder, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus species specificity: murine coronavirus binds to a mouse-specific epitope on its carcinoembryonic antigen-related receptor glycoprotein.",
      "title": "Coronavirus species specificity: murine coronavirus binds to a mouse-specific epitope on its carcinoembryonic antigen-related receptor glycoprotein.",
      "date": "1992-12-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1080/01478885.2020.1734718",
      "tags": [
          "CORD-19"
      ],
      "owner": " Anthony F. Henwood",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus disinfection in histopathology",
      "title": "Coronavirus disinfection in histopathology",
      "date": "2020-03-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " S G Sawicki,  D L  Sawicki",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus minus-strand RNA synthesis and effect of cycloheximide on coronavirus RNA synthesis.",
      "title": "Coronavirus minus-strand RNA synthesis and effect of cycloheximide on coronavirus RNA synthesis.",
      "date": "1986-01-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.3389/fmicb.2014.00296",
      "tags": [
          "CORD-19"
      ],
      "owner": "To S Fung, Ding X Liu",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus infection, ER stress, apoptosis and innate immunity",
      "title": "Coronavirus infection, ER stress, apoptosis and innate immunity",
      "date": "2014-06-17",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.amjmed.2015.05.034",
      "tags": [
          "CORD-19"
      ],
      "owner": "Geoffrey J Gorse, Mary M Donovan, Gira B Patel, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus and Other Respiratory Illnesses Comparing Older with Young Adults",
      "title": "Coronavirus and Other Respiratory Illnesses Comparing Older with Young Adults",
      "date": "2015-11-30",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " X Zhang,  C L  Liao,  M M  Lai",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus leader RNA regulates and initiates subgenomic mRNA transcription both in trans and in cis.",
      "title": "Coronavirus leader RNA regulates and initiates subgenomic mRNA transcription both in trans and in cis.",
      "date": "1994-08-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1177/0022034520914246",
      "tags": [
          "CORD-19"
      ],
      "owner": " L. Meng,  F.  Hua,  Z.  Bian",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Disease 2019 (COVID-19): Emerging and Future Challenges for Dental and Oral Medicine",
      "title": "Coronavirus Disease 2019 (COVID-19): Emerging and Future Challenges for Dental and Oral Medicine",
      "date": "2020-03-12",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " Stuart G. Siddell,  Helmut  Wege,  Andrea  Barthel, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus JHM: Cell-Free Synthesis of Structural Protein p60",
      "title": "Coronavirus JHM: Cell-Free Synthesis of Structural Protein p60",
      "date": "1980-01-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0022-2836(81)90463-0",
      "tags": [
          "CORD-19"
      ],
      "owner": "H Niemann, H.-D Klenk",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus glycoprotein E1, a new type of viral glycoprotein",
      "title": "Coronavirus glycoprotein E1, a new type of viral glycoprotein",
      "date": "1981-12-25",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jcm.02614-05",
      "tags": [
          "CORD-19"
      ],
      "owner": " Susanna K. P. Lau,  Patrick C. Y.  Woo,  Cyril C. Y.  Yip, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus HKU1 and Other Coronavirus Infections in Hong Kong",
      "title": "Coronavirus HKU1 and Other Coronavirus Infections in Hong Kong",
      "date": "2006-06-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1996.0118",
      "tags": [
          "CORD-19"
      ],
      "owner": "Seok Yong, John F Repass, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Transcription Mediated by Sequences Flanking the Transcription Consensus Sequence",
      "title": "Coronavirus Transcription Mediated by Sequences Flanking the Transcription Consensus Sequence",
      "date": "1996-03-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1006/viro.1994.1383",
      "tags": [
          "CORD-19"
      ],
      "owner": " Stanley M. Tahara,  Therese A.  Dietlin,  Cornelia C.  Bergmann, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Translational Regulation: Leader Affects mRNA Efficiency",
      "title": "Coronavirus Translational Regulation: Leader Affects mRNA Efficiency",
      "date": "1994-08-01",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " Pierre Baudoux,  Charles  Carrat,  Lydia  Besnardeau, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Pseudoparticles Formed with Recombinant M and E Proteins Induce Alpha Interferon Synthesis by Leukocytes",
      "title": "Coronavirus Pseudoparticles Formed with Recombinant M and E Proteins Induce Alpha Interferon Synthesis by Leukocytes",
      "date": "1998-11-03",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " P B Sethna,  D A  Brian",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus genomic and subgenomic minus-strand RNAs copartition in membrane-protected replication complexes.",
      "title": "Coronavirus genomic and subgenomic minus-strand RNAs copartition in membrane-protected replication complexes.",
      "date": "1997-10-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1021/cen-09809-buscon1",
      "tags": [
          "CORD-19"
      ],
      "owner": "",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus cancels chemical events",
      "title": "Coronavirus cancels chemical events",
      "date": "2020-03-09",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.3390/v2081803",
      "tags": [
          "CORD-19"
      ],
      "owner": "Patrick C Y Woo, Yi Huang, Susanna K P Lau, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Genomics and Bioinformatics Analysis",
      "title": "Coronavirus Genomics and Bioinformatics Analysis",
      "date": "2010-08-24",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/s2468-2667(20)30051-7",
      "tags": [
          "CORD-19"
      ],
      "owner": " Marc Fadel,  Jérôme  Salomon,  Alexis  Descatha",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus outbreak: the role of companies in preparedness and responses",
      "title": "Coronavirus outbreak: the role of companies in preparedness and responses",
      "date": "2020-02-28",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " D F Stern,  S I  Kennedy",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus multiplication strategy. II. Mapping the avian infectious bronchitis virus intracellular RNA species to the genome.",
      "title": "Coronavirus multiplication strategy. II. Mapping the avian infectious bronchitis virus intracellular RNA species to the genome.",
      "date": "1980-11-03",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " Sungwhan An,  Akihiko  Maeda,  Shinji  Makino",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Transcription Early in Infection",
      "title": "Coronavirus Transcription Early in Infection",
      "date": "1998-11-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1080/13550280490280292",
      "tags": [
          "CORD-19"
      ],
      "owner": "Sonia Navas-Martín, Susan R Weiss",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus replication and pathogenesis: Implications for the recent outbreak of severe acute respiratory syndrome (SARS), and the challenge for vaccine development",
      "title": "Coronavirus replication and pathogenesis: Implications for the recent outbreak of severe acute respiratory syndrome (SARS), and the challenge for vaccine development",
      "date": "2004",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/j.jacr.2020.02.008",
      "tags": [
          "CORD-19"
      ],
      "owner": "Soheil Kooraki, Melina Hosseiny, Lee Myers, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus (COVID-19) Outbreak: What the Department of Radiology Should Know",
      "title": "Coronavirus (COVID-19) Outbreak: What the Department of Radiology Should Know",
      "date": "2020-02-19",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1016/0168-1702(86)90037-7",
      "tags": [
          "CORD-19"
      ],
      "owner": "David Cavanagh', Philip J Davis, I Darryl, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus IBV: Partial amino terminal sequencing of spike polypeptide S2 identifies the sequence Arg-Arg-Phe-Arg-Arg at the cleavage site of the spike precursor propolypeptide of IBV strains Beaudette and M41",
      "title": "Coronavirus IBV: Partial amino terminal sequencing of spike polypeptide S2 identifies the sequence Arg-Arg-Phe-Arg-Arg at the cleavage site of the spike precursor propolypeptide of IBV strains Beaudette and M41",
      "date": "1986-02-28",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.2214/ajr.20.23034",
      "tags": [
          "CORD-19"
      ],
      "owner": " Sana Salehi,  Aidin  Abedi,  Sudheer  Balakrishnan, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Disease 2019 (COVID-19): A Systematic Review of Imaging Findings in 919 Patients",
      "title": "Coronavirus Disease 2019 (COVID-19): A Systematic Review of Imaging Findings in 919 Patients",
      "date": "2020-03-14",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " Adrian Cho",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus just caused the American Physical Society to cancel its biggest meeting of the year | Science | AAAS",
      "title": "Coronavirus just caused the American Physical Society to cancel its biggest meeting of the year | Science | AAAS",
      "date": "2020",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1128/jvi.78.7.3398-3406.2004",
      "tags": [
          "CORD-19"
      ],
      "owner": " Yun Li,  Li  Fu,  Donna M.  Gonzales, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Neurovirulence Correlates with the Ability of the Virus To Induce Proinflammatory Cytokine Signals from Astrocytes and Microglia",
      "title": "Coronavirus Neurovirulence Correlates with the Ability of the Virus To Induce Proinflammatory Cytokine Signals from Astrocytes and Microglia",
      "date": "2004-03-11",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1038/d41586-020-00154-w",
      "tags": [
          "CORD-19"
      ],
      "owner": "",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus latest: Trump requests $2.5 billion for coronavirus response",
      "title": "Coronavirus latest: Trump requests $2.5 billion for coronavirus response",
      "date": "2020-03-17",
      "source": "cord-19"
  },
  {
      "url": null,
      "tags": [
          "CORD-19"
      ],
      "owner": " P B Sethna,  S L  Hung,  D A  Brian",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus subgenomic minus-strand RNAs and the potential for mRNA replicons.",
      "title": "Coronavirus subgenomic minus-strand RNAs and the potential for mRNA replicons.",
      "date": "1989-07-03",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1002/jmv.25740",
      "tags": [
          "CORD-19"
      ],
      "owner": " Qi Lu,  Yuan  Shi",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus disease (COVID-19) and neonate: What neonatologist need to know",
      "title": "Coronavirus disease (COVID-19) and neonate: What neonatologist need to know",
      "date": "2020-03-12",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1152/ajprenal.00151.2014",
      "tags": [
          "CORD-19"
      ],
      "owner": " Matthew T. McMillan,  Xiao-Qing  Pan,  Ariana L.  Smith, et al",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus-induced demyelination of neural pathways triggers neurogenic bladder overactivity in a mouse model of multiple sclerosis",
      "title": "Coronavirus-induced demyelination of neural pathways triggers neurogenic bladder overactivity in a mouse model of multiple sclerosis",
      "date": "2014-09-01",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.2214/ajr.20.22954",
      "tags": [
          "CORD-19"
      ],
      "owner": " Yan Li,  Liming  Xia",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus Disease 2019 (COVID-19): Role of Chest CT in Diagnosis and Management",
      "title": "Coronavirus Disease 2019 (COVID-19): Role of Chest CT in Diagnosis and Management",
      "date": "2020-03-04",
      "source": "cord-19"
  },
  {
      "url": "https://doi.org/10.1186/s41182-020-00201-2",
      "tags": [
          "CORD-19"
      ],
      "owner": " George M. Bwire,  Linda S.  Paulo",
      "purpose": [
          "CORD-19 Research"
      ],
      "type": "text/html",
      "description": "Coronavirus disease-2019: is fever an adequate screening for the returning travelers?",
      "title": "Coronavirus disease-2019: is fever an adequate screening for the returning travelers?",
      "date": "2020-03-09",
      "source": "cord-19"
  }
];