<?php
namespace App\Command;

use App\Service\PostSearch;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:es:init', description: 'Create Elasticsearch index if missing')]
class EsInitCommand extends Command
{
    public function __construct(private PostSearch $ps) { parent::__construct(); }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->ps->createIndexIfMissing();
        $output->writeln('<info>Elasticsearch index is ready.</info>');
        return Command::SUCCESS;
    }
}
