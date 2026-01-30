CREATE TABLE `material_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` varchar(64) NOT NULL,
	`material_descricao` varchar(255) NOT NULL,
	`material_especificacao` text,
	`quantidade` int NOT NULL,
	`unidade` varchar(50) NOT NULL,
	`urgencia` varchar(50) NOT NULL,
	`foto1_url` text,
	`foto2_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` varchar(64) NOT NULL,
	`timestamp_envio` timestamp NOT NULL,
	`loja_id` int NOT NULL,
	`loja_label` varchar(255) NOT NULL,
	`solicitante_nome` varchar(255) NOT NULL,
	`solicitante_telefone` varchar(20),
	`numero_chamado` varchar(50),
	`tipo_equipe` varchar(50) NOT NULL,
	`empresa_terceira` varchar(255),
	`tipo_servico` varchar(50) NOT NULL,
	`sistema_afetado` varchar(50) NOT NULL,
	`descricao_geral_servico` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `material_requests_request_id_unique` UNIQUE(`request_id`)
);
