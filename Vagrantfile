# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-17.04"

  config.vm.network "private_network", ip: "192.168.50.5"

  config.vm.synced_folder "./", "/home/vagrant/Anna"

  config.vm.provider "virtualbox" do |v|
    v.name = "OneOS"
  end

  config.vm.provision "shell", path: "./configure"
end
