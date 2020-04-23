package org.policefoundation.covididx.api;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface QueryLogRepository extends MongoRepository<QueryLog, String> {}
