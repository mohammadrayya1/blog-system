<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250827180759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE likes DROP FOREIGN KEY FK_49CA4E7D9B6B5FBA');
        $this->addSql('ALTER TABLE likes ADD CONSTRAINT FK_49CA4E7D9B6B5FBA FOREIGN KEY (account_id) REFERENCES abstruct_account (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `likes` DROP FOREIGN KEY FK_49CA4E7D9B6B5FBA');
        $this->addSql('ALTER TABLE `likes` ADD CONSTRAINT FK_49CA4E7D9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
