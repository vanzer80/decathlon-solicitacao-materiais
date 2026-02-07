CREATE TABLE `materiais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`solicitacaoId` int NOT NULL,
	`requestId` varchar(64) NOT NULL,
	`materialDescricao` text NOT NULL,
	`materialEspecificacao` text,
	`quantidade` int NOT NULL,
	`unidade` varchar(20) NOT NULL,
	`urgencia` varchar(20) NOT NULL,
	`foto1Url` text,
	`foto2Url` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materiais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solicitacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(64) NOT NULL,
	`timestampEnvio` timestamp NOT NULL,
	`lojaId` varchar(10) NOT NULL,
	`lojaLabel` text NOT NULL,
	`solicitanteNome` varchar(255) NOT NULL,
	`solicitanteTelefone` varchar(20),
	`numeroChamado` varchar(50),
	`tipoEquipe` varchar(50) NOT NULL,
	`empresaTerceira` varchar(255),
	`tipoServico` varchar(50) NOT NULL,
	`sistemaAfetado` varchar(100) NOT NULL,
	`descricaoGeralServico` text NOT NULL,
	`statusCompra` varchar(50) NOT NULL DEFAULT 'Recebido',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `solicitacoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `solicitacoes_requestId_unique` UNIQUE(`requestId`)
);
